import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/database/connection";
import Attempt from "@/database/models/attempt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, title, category, score, attemptsLeft, completionTime } = body;

    if (!deviceId || !title || !category || score === undefined || completionTime === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await dbConnect();

    // ✅ Use findOneAndUpdate to avoid duplicate key errors
    const attemptData = await Attempt.findOneAndUpdate(
      { deviceId, title, category }, // Find by unique identifier
      {
        $set: { lastAttemptDate: new Date(), attemptsLeft }, // Update fields
        $push: { attemptHistory: { date: new Date(), score, completionTime } }, // Add attempt to history
        $max: { bestScore: score }, // Only update if new score is higher
      },
      { upsert: true, new: true } // Create if not exists, return updated document
    );

    // ✅ Calculate average completion time
    const totalTime = attemptData.attemptHistory.reduce(
      (sum: number, attempt: { completionTime?: number }) => sum + (attempt.completionTime || 0),
      0
    );
    attemptData.averageCompletionTime = totalTime / attemptData.attemptHistory.length;

    await attemptData.save(); // ✅ Save the updated document

    return NextResponse.json({
      title: attemptData.title,
      category: attemptData.category,
      attemptsLeft: attemptData.attemptsLeft,
      totalAttempts: attemptData.totalAttempts || 3,
      bestScore: attemptData.bestScore,
      averageCompletionTime: attemptData.averageCompletionTime, // ✅ Return average time
    });
  } catch (error) {
    console.error('Error saving attempt data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
