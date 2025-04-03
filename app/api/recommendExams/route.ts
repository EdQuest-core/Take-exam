import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const score = searchParams.get("score");

    if (!category) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Determine level based on score
    let currentLevel = "Beginner";
    if (score) {
      const scoreNum = parseFloat(score);
      if (scoreNum >= 80) {
        currentLevel = "Advanced";
      } else if (scoreNum >= 60) {
        currentLevel = "Intermediate";
      }
    }

    const categoryPath = path.join(process.cwd(), "data", category);
    const levels = ["Beginner", "Intermediate", "Advanced"];

    // Get the two other levels
    const recommendedLevels = levels.filter(level => level !== currentLevel);
    let recommendedExams: any[] = [];

    for (const level of recommendedLevels) {
      try {
        const levelPath = path.join(categoryPath, level);
        const files = await fs.readdir(levelPath);
        
        if (files.length > 0) {
          // Pick the first available exam
          const examFile = files[0];
          const filePath = path.join(levelPath, examFile);
          const fileContent = await fs.readFile(filePath, "utf-8");
          const examData = JSON.parse(fileContent);
          
          recommendedExams.push({
            id: examFile.replace('.json', ''),
            title: examData.title || `${level} ${category} Exam`,
            category: category,
            level: level,
            difficulty: level === "Beginner" ? "Easy" : level === "Intermediate" ? "Medium" : "Hard",
            estimatedTime: examData.timer || 0
          });
        }
      } catch (err) {
        console.warn(`No exams found for ${level} level in ${category}`);
      }
    }

    return NextResponse.json({ recommendedExams });
  } catch (error) {
    console.error("Error fetching recommended exams:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}