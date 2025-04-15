import React, { useEffect, useState } from "react"
import SearchBar from "@/components/dashBoard/searchbarelements"
import { useRouter } from "next/navigation"

interface ProblemItem {
  id: number
  title: string
  timeInMinutes: number
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  level?: string
}

const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<ProblemItem[]>([])
  const [filteredProblems, setFilteredProblems] = useState<ProblemItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const itemsPerPage = 10

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)

        //parameters for filters
        let queryParams = new URLSearchParams({
          page: currentPage.toString(),
        })

        if (selectedDifficulty) {
          queryParams.append("difficulty", selectedDifficulty)
        }

        if (selectedDuration) {
          queryParams.append("duration", selectedDuration)
        }

        if (selectedLevel) {
          queryParams.append("level", selectedLevel)
        }

        if (selectedCategory) {
          queryParams.append("category", encodeURIComponent(selectedCategory))
        }

        if (searchTerm) {
          queryParams.append("search", searchTerm)
        }

        const response = await fetch(`/api/topics?${queryParams.toString()}`)
        const data = await response.json()
        setProblems(data.problems)
        setFilteredProblems(data.problems)
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error("Error fetching problems:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProblems()
  }, [
    currentPage,
    selectedDifficulty,
    selectedDuration,
    selectedLevel,
    selectedCategory,
    searchTerm,
  ])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-[#F3FFE7] text-[#567F2D]"
      case "Medium":
        return "bg-[#FFF8D0] text-[#CCA028]"
      case "Hard":
        return "bg-[#FFEAE7] text-[#7F352D]"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty)
    setCurrentPage(1)
  }

  const handleDurationChange = (duration: string) => {
    setSelectedDuration(duration)
    setCurrentPage(1)
  }

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const router = useRouter()

  const handleProblemClick = (problem: ProblemItem) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("descriptionData", JSON.stringify(problem))
      router.push("/description")
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 md:px-6">
      <SearchBar
        onDifficultyChange={handleDifficultyChange}
        onDurationChange={handleDurationChange}
        onLevelChange={handleLevelChange}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
      />
      <div className="rounded-lg py-2">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="spinner">Loading...</div>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-center text-lg text-gray-500">
              No problems found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            {filteredProblems.map((problem, index) => {
              const itemNumber = (currentPage - 1) * itemsPerPage + index + 1
              return (
                <React.Fragment key={problem.id}>
                  <div
                    className="group relative flex cursor-pointer flex-col justify-between gap-2 px-4 py-4
                      sm:flex-row sm:items-center sm:gap-0 sm:px-6"
                    onClick={() => handleProblemClick(problem)}
                  >
                    <div
                      className="absolute top-1/2 right-2 left-2 h-12 -translate-y-1/2 rounded-3xl bg-white
                        opacity-0 transition-all duration-300 group-hover:opacity-100
                        group-hover:shadow-md"
                    ></div>
                    <div className="z-10 flex items-center">
                      <span
                        className="mr-2 text-base font-medium text-gray-700 transition-all group-hover:font-bold
                          sm:text-lg"
                      >
                        {String(itemNumber).padStart(2, "0")}.
                      </span>
                      <span
                        className="text-base font-medium text-gray-800 transition-all group-hover:font-bold
                          sm:text-lg"
                      >
                        {problem.title}
                      </span>
                    </div>
                    <div className="z-10 flex flex-wrap items-center gap-4 sm:flex-nowrap">
                      <div className="flex min-w-[80px] items-center gap-2">
                        <img
                          src="/media/clock.png"
                          alt="Time Icon"
                          className="h-5 w-5"
                        />
                        <span className="text-base font-medium text-gray-700 sm:text-lg">
                          {problem.timeInMinutes} min
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-[110px] rounded-full px-4 py-1 text-center text-base font-medium
                            transition-all group-hover:font-bold sm:w-[130px] sm:text-lg
                            ${getDifficultyColor(problem.difficulty)}`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < filteredProblems.length - 1 && (
                    <div className="mx-4 w-full sm:mx-6">
                      <svg
                        width="100%"
                        height="1"
                        className="dark:stroke-theme-300 mx-auto stroke-black"
                      >
                        <path
                          strokeDasharray="7 7"
                          strokeLinecap="round"
                          strokeWidth="3"
                          d="M1.5 1.5h1397"
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pb-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg p-2 hover:bg-gray-200 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 rotate-180 sm:h-6 sm:w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-9 sm:w-9
                      ${currentPage === page ? "bg-black text-white" : "text-gray-700 hover:bg-gray-200"}`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 hover:bg-gray-200 disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProblemList
