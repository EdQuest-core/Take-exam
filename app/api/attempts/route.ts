import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/database/connection";
import Attempt from "@/database/models/attempt";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const title = searchParams.get('title');
    const category = searchParams.get('category');

    if (!deviceId || !title || !category) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await dbConnect();

    // Find attempt data for this device and exam
    let attemptData = await Attempt.findOne({ deviceId, title, category });

    // If no data exists, create a new attempt record (temporary object, not saved to DB)
    if (!attemptData) {
      attemptData = {
        deviceId,
        title,
        category,
        attemptsLeft: 3,
        totalAttempts: 3,
        bestScore: 0,
        averageCompletionTime: 0, // Default completion time
        attemptHistory: []
      };
    }

    return NextResponse.json({
      title: attemptData.title,
      category: attemptData.category,
      attemptsLeft: attemptData.attemptsLeft,
      totalAttempts: attemptData.totalAttempts,
      bestScore: attemptData.bestScore,
      averageCompletionTime: attemptData.averageCompletionTime, // ✅ Include average completion time
      attemptHistory: attemptData.attemptHistory // ✅ Include attempt history
    });
  } catch (error) {
    console.error('Error fetching attempt data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
