"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ThemeToggle from "./themeToggle"
import { toast, Toaster } from "sonner"

// Types
type QuestionType = {
  question: string
  options: string[]
  correctAnswer: string
}

type ExamData = {
  title: string
  timer: number
  level: string
  category: string
  questions: QuestionType[]
}

// Helper to get question status
function getQuestionStatus(
  index: number,
  selectedOptions: Record<number, string | null>,
  visitedQuestions: number[],
  markedQuestions: number[]
):
  | "notVisited"
  | "answered"
  | "markedAndAnswered"
  | "markedForReview"
  | "notAnswered" {
  if (!visitedQuestions.includes(index)) {
    return "notVisited"
  }

  if (markedQuestions.includes(index)) {
    return selectedOptions[index] ? "markedAndAnswered" : "markedForReview"
  }

  if (selectedOptions[index]) {
    return "answered"
  }

  return "notAnswered"
}

// Sidebar Component
function ExamSidebar({
  examData,
  selectedOptions,
  visitedQuestions,
  markedQuestions,
  setMarkedQuestions,
  activeQuestion,
  setActiveQuestion,
  theme, // Added theme prop
  submitHovered, // Added submitHovered prop
  setSubmitHovered, // Added setSubmitHovered prop
  handleSubmit, // Added handleSubmit prop
  submitted, // Added submitted prop
}: {
  examData: ExamData | null
  selectedOptions: Record<number, string | null>
  visitedQuestions: number[]
  markedQuestions: number[]
  setMarkedQuestions: (questions: number[]) => void
  activeQuestion: number
  setActiveQuestion: (questionIndex: number) => void
  theme: string
  submitHovered: boolean
  setSubmitHovered: (hovered: boolean) => void
  handleSubmit: (isAutoSubmit: boolean) => void
  submitted: boolean
}) {
  if (!examData) return null

  return (
    <aside
      className={`fixed top-16 right-0 h-full min-h-[931px] w-full rounded-l-3xl border-l
        border-gray-300 bg-white p-4 text-gray-800 md:w-1/5 dark:border-gray-700
        dark:bg-[#333333] dark:text-gray-100 ${
        window.innerWidth < 768 ? "w-full" : "md:w-1/5" }`}
    >
      {/* Title & Category */}
      <div className="mb-6">
      <div className="flex justify-end">
  <p
    className="inline-block rounded-full bg-black px-4 py-1 text-sm font-medium text-white dark:bg-white dark:text-black"
  >
    {examData.category}
  </p>
</div>


        <h2 className="mt-2 text-right text-xl font-bold text-black md:text-2xl dark:text-white">
          {examData.title}
        </h2>
        
        <div className="hidden md:flex justify-end mt-2">
        
        <svg
          className="hidden md:block"
          width="205"
          
          height="2"
          viewBox="0 0 205 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="1"
            y1="1"
            x2="204"
            y2="1"
            stroke="#0C0C0C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="12 12"
          />
        </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 items-end">
        <div className="mb-2 flex items-center justify-end">
          <span className="font-normal text-black dark:text-white">
            Not Visited
          </span>
          <div className="ml-2 h-6 w-6 rounded-full bg-[#D9D9D9]" />
        </div>
        <div className="mb-2 flex items-center justify-end">
          <span className="font-normal text-black dark:text-white">
            Answered
          </span>
          <div className="ml-2 h-6 w-6 rounded-full bg-[#CCEEAA]" />
        </div>
        <div className="mb-2 flex items-center justify-end">
          <span className="font-normal text-black dark:text-white">
            Marked for Review
          </span>
          <div className="ml-2 h-6 w-6 rounded-full bg-[#AACCFF]" />
        </div>
        <div className="flex items-center justify-end">
          <span className="font-normal text-black dark:text-white">
            Not Answered
          </span>
          <div className="ml-2 h-6 w-6 rounded-full bg-[#FFB1AA]" />
        </div>
      </div>

      {/* Question Circles Box */}
      <div className="fixed right-0 w-full rounded-xl bg-[#F7F7F7] p-4 md:w-[294px]">
        <p className="mb-4 text-left font-semibold text-black dark:text-white">
          Questions
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {examData.questions.map((_, index) => {
            const status = getQuestionStatus(
              index,
              selectedOptions,
              visitedQuestions,
              markedQuestions
            )
            let bgColor = "bg-[#D9D9D9]"
            if (status === "answered") bgColor = "bg-[#CCEEAA]"
            if (status === "markedForReview") bgColor = "bg-[#AACCFF]"
            if (status === "markedAndAnswered") bgColor = "bg-[#AACCFF]"
            if (status === "notAnswered") bgColor = "bg-[#FFB1AA]"

            return (
              <div
                key={index}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sm
                font-medium text-black ${bgColor}`}
                onClick={() => {
                  setActiveQuestion(index)

                  // Scroll to the corresponding question
                  const questionElement = document.getElementById(
                    `question-${index}`
                  )
                  if (questionElement) {
                    questionElement.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }
                }}
              >
                {index + 1}
              </div>
            )
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-center">
        <motion.div
          className="relative flex justify-center"
          onHoverStart={() => setSubmitHovered(true)}
          onHoverEnd={() => setSubmitHovered(false)}
        >
          <motion.div
            className="absolute z-0 h-10 w-40 rounded-full md:h-12 md:w-48"
            initial={{
              rotate: -3,
              backgroundColor: theme === "dark" ? "#FFCC66" : "#000000",
            }}
            animate={{
              backgroundColor: submitHovered
                ? "#FFCC66"
                : theme === "dark"
                  ? "#000000"
                  : "#000000",
            }}
            transition={{
              backgroundColor: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
            style={{ transformOrigin: "center" }}
          />

          <button
            className="relative z-10 flex h-10 w-40 items-center justify-center rounded-full border-2
              border-black bg-white text-sm font-medium text-gray-800 hover:bg-white md:h-12
              md:w-48 md:text-base lg:text-lg dark:border-black dark:bg-[#333333]
              dark:text-white dark:hover:bg-[#333333]"
            onClick={() => handleSubmit(false)}
            disabled={submitted}
          >
            {submitted ? "Submitting..." : "Submit"}
          </button>
        </motion.div>
      </div>

      
    </aside>
  )
}

export default function Exam2() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const category = decodeURIComponent(
    searchParams?.get("category") || ""
  ).trim()
  const title = decodeURIComponent(searchParams?.get("title") || "").trim()

  const [examData, setExamData] = useState<ExamData | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(300)
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, string | null>
  >({})
  const [submitted, setSubmitted] = useState<boolean>(false)

  // NEW STATES for question statuses
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([])
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([])
  const [activeQuestion, setActiveQuestion] = useState<number>(0)

  const [hovered, setHovered] = useState<boolean>(false)
  const [submitHovered, setSubmitHovered] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [theme, setTheme] = useState<string>("light")

  // Load and listen for theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "light"
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  // Fetch exam data
  useEffect(() => {
    if (!category || !title) {
      toast.error("Invalid exam parameters. Please try again.")
      return
    }
    const encodedCategory = encodeURIComponent(category)
    const encodedTitle = encodeURIComponent(title)

    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `/api/questions?category=${encodedCategory}&title=${encodedTitle}`
        )
        if (!response.ok) throw new Error("Failed to load data")
        const data: ExamData = await response.json()
        setExamData(data)
        setTimeLeft(data.timer || 300)
      } catch (error) {
        console.error("Error loading questions:", error)
        toast.error("Failed to load questions. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [category, title])

  // Save theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
      return () => clearInterval(interval)
    } else if (timeLeft === 0) {
      handleSubmit(true)
    }
  }, [timeLeft, submitted])

  // Format timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle selecting an option
  const handleOptionSelect = (index: number, option: string) => {
    setSelectedOptions((prev) => ({ ...prev, [index]: option }))
    // Mark question as visited once the user interacts
    if (!visitedQuestions.includes(index)) {
      setVisitedQuestions((prev) => [...prev, index])
    }
  }

  // Mark question as flagged (if you have a button for it)
  const handleMarkQuestion = (index: number) => {
    if (!markedQuestions.includes(index)) {
      setMarkedQuestions((prev) => [...prev, index])
    } else {
      // unmark if it is already marked
      setMarkedQuestions((prev) => prev.filter((qIndex) => qIndex !== index))
    }
  }

  // Handle final submit
  const handleSubmit = (isAutoSubmit: boolean = false) => {
    if (!examData) return
    const allAnswered = examData.questions.every(
      (_, index: number) => selectedOptions[index] !== undefined
    )

    if (!isAutoSubmit && !allAnswered) {
      toast.error("Please answer all questions before submitting.", {
        duration: 3000,
        position: "top-center",
      })
      return
    }

    setSubmitted(true)
    toast.success("Quiz submitted successfully!", {
      duration: 2000,
      position: "top-center",
    })

    localStorage.setItem("selectedOptions", JSON.stringify(selectedOptions))
    localStorage.setItem("examData", JSON.stringify(examData))

    setTimeout(() => {
      router.push("/result")
    }, 1500)
  }

  // Option labels
  const optionLabels = ["A", "B", "C", "D"]

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 pr-40 md:flex-row dark:bg-black">
      {/* Main content */}
      <div className="flex flex-1 flex-col items-center pr-4 md:pr-8">
        {/* Theme Toggle */}
        <div className="flex w-full justify-end">
          <ThemeToggle />
        </div>

        {/* Title Card with animation */}
        <motion.div
          className="relative flex justify-center py-4 md:py-8"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <motion.div
            className="absolute z-0 h-12 w-full rounded-full md:h-16 md:w-[716px]"
            initial={{ rotate: -2 }}
            animate={{
              backgroundColor: hovered
                ? "#FFCC66"
                : theme === "dark"
                  ? "#ffffff"
                  : "#000000",
            }}
            transition={{
              backgroundColor: {
                duration: 0.3,
                ease: "easeInOut",
              },
            }}
          />

          {/* Title */}
          <div
            className="relative z-10 flex h-12 w-full items-center justify-center rounded-full border-2
              border-black bg-white text-lg font-bold text-gray-800 md:h-16 md:w-[716px]
              md:text-3xl dark:border-black dark:bg-[#333333] dark:text-white"
          >
            {loading ? "Loading..." : examData?.title || title}
          </div>
        </motion.div>

        {/* Main Question Container */}
        <div className="relative mt-6 w-full max-w-full md:max-w-5xl">
          {/* Timer */}
          <div className="absolute -top-8 right-4 z-20 flex items-center justify-center">
            <div className="relative">
              <svg
                className="w-28 md:w-36"
                width="140"
                height="70"
                viewBox="0 0 140 70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="11"
                  width="138"
                  height="58"
                  rx="29"
                  fill={theme === "dark" ? "#1F2937" : "white"}
                  stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                  strokeWidth="2"
                />
                <rect
                  x="5"
                  y="15"
                  width="130"
                  height="50"
                  rx="25"
                  stroke="#FFCC66"
                  strokeWidth="4"
                />
                <line
                  x1="70"
                  y1="10.5"
                  x2="70"
                  y2="2.5"
                  stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                  strokeWidth="2"
                />
                <path
                  d="M44 2H94"
                  stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center pt-2 text-base font-semibold
                  text-gray-800 md:text-xl dark:text-white"
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Questions Container */}
          <div
            className="flex min-h-[calc(100vh-200px)] flex-col rounded-4xl border border-gray-300
              bg-white p-4 shadow-lg md:p-6 dark:border-gray-700 dark:bg-[#333333]"
          >
            <div
              className="flex-grow overflow-y-auto px-4 pt-6 md:px-6 md:pt-12"
              style={{ maxHeight: "70vh" }}
            >
              {loading ? (
                <p className="text-center text-gray-600 dark:text-gray-300">
                  Loading questions...
                </p>
              ) : (
                examData?.questions.map(
                  (question: QuestionType, index: number) => (
                    <div
                      key={index}
                      id={`question-${index}`}
                      className="mb-8"
                      onMouseEnter={() => {
                        // Mark question as visited on hover or scroll
                        if (!visitedQuestions.includes(index)) {
                          setVisitedQuestions((prev) => [...prev, index])
                        }
                      }}
                    >
                      <h2 className="text-black-800 mb-4 text-xl font-semibold dark:text-white">
                        {index + 1}. {question.question}
                      </h2>
                      {question.options.map(
                        (option: string, optionIndex: number) => (
                          <div
                            key={optionIndex}
                            className={`my-3 cursor-pointer rounded-4xl border p-4 pl-12 ${
                              selectedOptions[index] === option
                                ? `border-gray-950 bg-[#FFCC66] text-gray-800 dark:border-yellow-200
                                  dark:bg-[#FFCC66] dark:text-black`
                                : `dark:hover:bg-black-700 border-gray-300 bg-white text-black hover:bg-gray-100
                                  dark:border-gray-600 dark:bg-[#333333] dark:text-white`
                              }`}
                            onClick={() => handleOptionSelect(index, option)}
                          >
                            <span className="mr-2 font-bold text-black">
                              {optionLabels[optionIndex]}.
                            </span>{" "}
                            <span className="font-medium text-black">
                              {option}
                            </span>
                          </div>
                        )
                      )}

                      {/* Example "Mark" button to illustrate flagged logic */}
                      <button
                        className={`mt-2 rounded-full border px-4 py-2 text-sm ${
                          markedQuestions.includes(index)
                            ? "bg-blue-500 text-white"
                            : "bg-black text-white dark:bg-white dark:text-black"
                          }`}
                        onClick={() => handleMarkQuestion(index)}
                      >
                        {markedQuestions.includes(index)
                          ? "Unmark"
                          : "Mark & Answer"}
                      </button>
                    </div>
                  )
                )
              )}
            </div>




          </div>
        </div>
      </div>

      {/* Sidebar */}
      <ExamSidebar
        examData={examData}
        selectedOptions={selectedOptions}
        visitedQuestions={visitedQuestions}
        markedQuestions={markedQuestions}
        setMarkedQuestions={setMarkedQuestions}
        activeQuestion={activeQuestion}
        setActiveQuestion={setActiveQuestion}
        theme={theme} // Pass theme
        submitHovered={submitHovered} // Pass submitHovered
        setSubmitHovered={setSubmitHovered} // Pass setSubmitHovered
        handleSubmit={handleSubmit} // Pass handleSubmit
        submitted={submitted} // Pass submitted
      />
    </div>
  )
}
