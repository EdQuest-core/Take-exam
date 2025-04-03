"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ExamData = {
    title: string;
    timer: number;
    level: string;
    difficulty: string;
    category: string;
    whyTakeExam: string;
    whoShouldTake: string;
    totalQuestions: number;
    skill: string;       
    knowledge: string;
    application: string;
    why: string;
};

type AttemptData = {
    title: string;
    category: string;
    attemptsLeft: number;
    totalAttempts: number;
    bestScore: number;
};

const Description = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const category = decodeURIComponent(searchParams?.get("category") || "").trim();
    const title = decodeURIComponent(searchParams?.get("title") || "").trim();
    const [showFullText, setShowFullText] = useState(false);

    const [hovered, setHovered] = useState<boolean>(false);
    const [theme, setTheme] = useState<string>("light");
    const [examData, setExamData] = useState<ExamData | null>(null);
    const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [deviceId, setDeviceId] = useState<string>("");

      // percentage string to no
      const parsePercentage = (value: string): number => {
        if (!value) return 0;
        const match = value.match(/(\d+)/);
        return match && match[1] ? parseInt(match[1]) : 0;
    };

    const limitWords = (text: string, wordLimit: number) => {
        const words = text.split(" ");
        return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
    };

    // Generate or retrive id
    useEffect(() => {
        let storedDeviceId = localStorage.getItem("deviceId");
        if (!storedDeviceId) {
            storedDeviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            localStorage.setItem("deviceId", storedDeviceId);
        }
        setDeviceId(storedDeviceId);
    }, []);

    useEffect(() => {
        const fetchProblemDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/description?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch exam details");
                }
                const data = await response.json();
                setExamData(data);
            } catch (error) {
                console.error("Error fetching exam details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (title && category) {
            fetchProblemDetails();
        }
    }, [title, category]);

    // Fetch attempt data
    useEffect(() => {
        const fetchAttemptData = async () => {
            if (!deviceId || !title || !category) return;
            
            try {
                const response = await fetch(`/api/attempts?deviceId=${deviceId}&title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch attempt data");
                }
                const data = await response.json();
                setAttemptData(data);
            } catch (error) {
                console.error("Error fetching attempt data:", error);
                setAttemptData({
                    title,
                    category,
                    attemptsLeft: 3, 
                    totalAttempts: 3,
                    bestScore: 0
                });
            }
        };

        fetchAttemptData();
    }, [deviceId, title, category]);

    const handleStartTest = () => {
        if (examData && attemptData && attemptData.attemptsLeft > 0) {
            // Save current attempt data to localStorage for access during the test
            localStorage.setItem("currentAttempt", JSON.stringify({
                deviceId,
                title: examData.title,
                category: examData.category,
                attemptsLeft: attemptData.attemptsLeft - 1 
            }));
            
            router.push(`/testPage?title=${encodeURIComponent(examData.title)}&category=${encodeURIComponent(examData.category)}`);
        } else {
            alert("You have no attempts left for this exam!");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#E6E9F0]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
        );
    }

    // Parse the percentage values 
    const skillPercent = examData?.skill ? parsePercentage(examData.skill) : 0;
    const knowledgePercent = examData?.knowledge ? parsePercentage(examData.knowledge) : 0;
    const applicationPercent = examData?.application ? parsePercentage(examData.application) : 0;


    return (
        <div className="min-h-screen bg-[#E6E9F0] flex flex-col items-center justify-center p-4">
            <motion.div
                className="relative w-full max-w-2xl"
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
            >
                {/* Tilted Background */}
                <motion.div
                    className="absolute z-0 h-16 w-full rounded-full"
                    initial={{ rotate: -2 }}
                    animate={{
                        backgroundColor: hovered
                            ? "#FFCC66"
                            : theme === "dark"
                                ? "#ffffff"
                                : "#000000"
                    }}
                    transition={{
                        backgroundColor: {
                            duration: 0.3,
                            ease: "easeInOut"
                        }
                    }}
                />

                {/* Title Card*/}
                <div className={`relative z-10 flex h-16 w-full items-center justify-center rounded-full border-2 border-black text-3xl font-bold text-gray-800 ${theme === "dark" ? "bg-[#333333] text-white" : "bg-white text-black"}`}>
                    {examData?.title || title}
                </div>
            </motion.div>

            {/* left & right grid*/}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl mt-10">
                <div className="bg-white shadow-lg rounded-3xl p-6 flex-1 flex items-center justify-between relative">
                    {/* Left */}
                    <div className="space-y-5 flex-1">
                        {/* Skill */}
                        <div className="relative">
                            <span className="font-medium text-lg">Skill</span>
                            <div className="w-56 h-4 bg-[#AAF0EE] rounded-full relative mt-2">
                                <div 
                                    className="h-full bg-[#AAF0EE] rounded-full" 
                                    style={{ width: `${skillPercent}%` }}
                                ></div>
                                <div 
                                    className="absolute -top-2 w-8 h-8 rounded-full bg-[#AAF0EE] border-2 border-black flex items-center justify-center text-xs font-bold"
                                    style={{ left: `${skillPercent}%`, transform: 'translateX(-50%)' }}
                                >
                                    {skillPercent}%
                                </div>
                            </div>
                        </div>

                        {/* Knowledge */}
                        <div className="relative">
                            <span className="font-medium text-lg">Knowledge</span>
                            <div className="w-56 h-4 bg-[#CCEEAA] rounded-full relative mt-2">
                                <div 
                                    className="h-full bg-[#CCEEAA] rounded-full" 
                                    style={{ width: `${knowledgePercent}%` }}
                                ></div>
                                <div 
                                    className="absolute -top-2 w-8 h-8 rounded-full bg-[#CCEEAA] border-2 border-black flex items-center justify-center text-xs font-bold"
                                    style={{ left: `${knowledgePercent}%`, transform: 'translateX(-50%)' }}
                                >
                                    {knowledgePercent}%
                                </div>
                            </div>
                        </div>

                        {/* Application */}
                        <div className="relative">
                            <span className="font-medium text-lg">Application</span>
                            <div className="w-56 h-4 bg-[#DDBBF1] rounded-full relative mt-2">
                                <div 
                                    className="h-full bg-[#DDBBF1] rounded-full" 
                                    style={{ width: `${applicationPercent}%` }}
                                ></div>
                                <div 
                                    className="absolute -top-2 w-8 h-8 rounded-full bg-[#DDBBF1] border-2 border-black flex items-center justify-center text-xs font-bold"
                                    style={{ left: `${applicationPercent}%`, transform: 'translateX(-50%)' }}
                                >
                                    {applicationPercent}%
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Dashed Line */}
                    <div className="h-full flex justify-center ml-5">
                        <svg width="2.5" height="200px" className="stroke-black">
                            <path strokeDasharray="9 9" strokeLinecap="round" strokeWidth="2.5" d="M1 0V200" />
                        </svg>
                    </div>

                    {/* Right */}
                    <div className="ml-6 flex flex-col items-center space-y-2">
                        {/* Attempts */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2">
                                <img src="/media/attemptarrow.png" alt="Arrow Icon" className="h-10 w-18" />
                            </div>
                            <span className="text-black mt-2">
                                <span className="font-bold text-black">
                                    {attemptData ? `${attemptData.totalAttempts - attemptData.attemptsLeft}/${attemptData.totalAttempts}` : "0/03"}
                                </span>{" "}
                                Attempt
                            </span>
                        </div>

                        {/* Dashed Line */}
                        <div className="w-full">
                            <svg width="100%" height="2.5" className="stroke-black">
                                <path strokeDasharray="9 9" strokeLinecap="round" strokeWidth="3" d="M1.5 1.5h1397" />
                            </svg>
                        </div>

                        {/* Difficulty Section*/}
                        <div className="text-1sm font-semibold text-black dark:text-white">
                            {examData?.level || "Loading Level..."}
                        </div>
                        <div className="flex items-center relative">
                            <img 
                                src="/media/staricon.png" 
                                alt="Star Icon" 
                                className="h-9 w-9 absolute -top-0.4 left-0 z-10"
                            />
                
                            {/* Difficulty Pill */}
                            <div className={`pl-11 pr-5 py-1 text-lg rounded-full flex items-center relative z-0
                                ${
                                    examData?.difficulty?.toLowerCase() === 'easy' 
                                        ? 'bg-[#F3FFE7] text-[#567F2D]' 
                                        : examData?.difficulty?.toLowerCase() === 'medium' 
                                            ? 'bg-[#FFF8D0] text-[#CCA028]' 
                                            : examData?.difficulty?.toLowerCase() === 'hard' 
                                                ? 'bg-[#FFEAE7] text-[#7F352D]' 
                                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                <span className="font-semibold">
                                    {examData?.difficulty || "Medium"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Right grid*/}
                <div className="bg-white shadow-lg rounded-3xl p-6 flex-1">
                    <h2 className="text-xl font-bold mb-3">Why take this Exam?</h2>
                    <p className="text-black text-lg font-100">
                        {examData && showFullText ? examData.why : examData ? limitWords(examData.why, 20) : ""}
                    </p>
                    {examData && (
                        <>
                            {!showFullText && examData.why.split(" ").length > 20 && (
                                <button
                                    className="text-gray-400 block mt-2"
                                    onClick={() => setShowFullText(true)}
                                >
                                    Read More...
                                </button>
                            )}
                            {showFullText && (
                                <button
                                    className="text-gray-400 block mt-2"
                                    onClick={() => setShowFullText(false)}
                                >
                                    Read Less
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* who will*/}
            <div className="mt-6 text-center">
                <h3 className="text-3xl font-medium mb-4">Who will take this exam?</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                    <button className="border border-black px-4 py-2 rounded-full font-bold text-lg">B.Tech/B.E. (all specializations)</button>
                    <button className="border border-black px-4 py-2 rounded-full font-bold text-lg">BSc IT</button>
                    <button className="border border-black px-4 py-2 rounded-full font-bold text-lg">BCA</button>
                    <button className="border border-black px-4 py-2 rounded-full font-bold text-lg">MCA</button>
                </div>

                {/* start button */}
                <div className="mt-10 flex justify-center">
            <div className="relative cursor-pointer" onClick={handleStartTest}>
                <svg width="150" height="120" viewBox="0 0 120 100">
                    <path 
                        d="M10 10 L110 10 L60 90 Z" 
                        fill="black" 
                        stroke="black" 
                        strokeWidth="20" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white font-medium text-xl mb-3 pointer-events-none">
                    Start <br /> Test
                </div>
            </div>
        </div>
</div>

            {/* sidebar */}
            <div className="absolute left-0 top-30 min-h-[650px] max-h-[910px] w-[270px] bg-white shadow-lg rounded-r-3xl p-4 flex flex-col overflow-auto">
                {/* category name */}
                <div className="absolute top-0 left-5 rounded-t-none rounded-b-3xl px-6 py-0.5 pb-0 text-lg text-white bg-black">
                {examData?.category || "Loading..."}
            </div>

            {/* Title */}
            <h2 className="mt-4 text-lg font-bold mt-8">
                {examData?.title || "Loading..."}
            </h2>

            {/* Divider */}
            <div className="w-full mt-8">
                <svg width="50%" height="2" className="stroke-black">
                    <path strokeDasharray="9 9" strokeLinecap="round" strokeWidth="3" d="M1.5 1.5h1397" />
                </svg>
            </div>

            {/* Timer */}
            <div className="absolute mt-15 right-2 z-20 flex items-center justify-center">
                <div className="relative">
                    <svg
                        width="130"
                        height="70"
                        viewBox="0 0 140 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Outer Rounded Rectangle */}
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
                        
                        {/* Inner Yellow Border */}
                        <rect
                            x="5"
                            y="15"
                            width="130"
                            height="50"
                            rx="25"
                            stroke="#FFCC66"
                            strokeWidth="4"
                        />

                        {/* Middle Vertical Line */}
                        <line
                            x1="70"
                            y1="10.5"
                            x2="70"
                            y2="2.5"
                            stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                            strokeWidth="2"
                        />

                        {/* Top Horizontal Line */}
                        <path
                            d="M44 2H94"
                            stroke={theme === "dark" ? "#E5E7EB" : "#0C0C0C"}
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Timer Value */}
                    <div className="absolute inset-0 flex items-center justify-center pt-2 text-xl font-semibold text-gray-800 dark:text-white">
                        {examData?.timer ? `${examData.timer}:00` : "Loading..."}
                    </div>
                </div>
            </div>
                {/* Status */}
                <div className="mt-4 space-y-2 text-lg">
                    <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#D9D9D9]"></span>
                    <span>Not visited</span>
                    </div>
                    <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#CCEEAA]"></span>
                    <span>Saved answers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#AACCFF]"></span>
                    <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFB1AA]"></span>
                    <span>Not answered</span>
                    </div>
                </div>
                
                {/* Question no */}
                <div className="-ml-4 mr-6 mt-6 bg-[#F7F7F7] p-2 rounded-3xl"> 
                <h3 className="text-lg font-semibold mb-2">Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                    {examData?.totalQuestions
                        ? Array.from({ length: examData.totalQuestions }, (_, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#D9D9D9] text-sm font-semibold"
                            >
                                {String(i + 1).padStart(2, "0")}
                            </div>
                        ))
                        : "Loading..."
                    }
                </div>
            </div>
    </div>
        </div>
    );
};

export default Description;