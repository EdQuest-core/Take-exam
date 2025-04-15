import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/database/connection"
import Attempt from "@/database/models/attempt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { deviceId, title, category, score, attemptsLeft, completionTime } = body

    if (!deviceId || !title || !category || score === undefined || completionTime === undefined) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    await dbConnect()

    // find existing document
    let attemptData = await Attempt.findOne({ deviceId, title, category })
    
    if (!attemptData) {
      // Create new record if it doesn't exist
      attemptData = new Attempt({
        deviceId,
        title,
        category,
        attemptsLeft,
        totalAttempts: 3,
        bestScore: score,
        lastAttemptDate: new Date(),
        attemptHistory: [{ date: new Date(), score, completionTime }],
        averageCompletionTime: completionTime
      })
    } else {
      // Update existing record
      attemptData.attemptsLeft = attemptsLeft
      attemptData.lastAttemptDate = new Date()
      
      // Update best score if current score is higher
      if (score > attemptData.bestScore) {
        attemptData.bestScore = score
      }
      
      // Add new attempt to history
      attemptData.attemptHistory.push({ 
        date: new Date(), 
        score, 
        completionTime 
      })
      
      // Recalculate average completion time
      const totalTime = attemptData.attemptHistory.reduce(
        (sum: number, attempt: { completionTime?: number }) => sum + (attempt.completionTime || 0),
        0
      )
      
      attemptData.averageCompletionTime = totalTime / attemptData.attemptHistory.length
    }
    
    // Save all changes
    await attemptData.save()

    return NextResponse.json({
      title: attemptData.title,
      category: attemptData.category,
      attemptsLeft: attemptData.attemptsLeft,
      totalAttempts: attemptData.totalAttempts,
      bestScore: attemptData.bestScore,
      averageCompletionTime: attemptData.averageCompletionTime,
      attemptHistory: attemptData.attemptHistory
    })
  } catch (error) {
    console.error("Error saving attempt data:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}