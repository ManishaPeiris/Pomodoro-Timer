import { useState, useEffect, useRef } from "react";
import { FaPlay, FaPause, FaRedo, FaMoon, FaSun } from "react-icons/fa";
import { motion } from "framer-motion";
import Heroimg1 from '../images/background.jpg';
import Heroimg2 from '../images/girl character.jpg';
import Heroimg3 from '../images/timemanage.jpg';

export default function PomodoroTimer() {
    const [workTime, setWorkTime] = useState(() => parseInt(localStorage.getItem("workTime")) || 25);
    const [breakTime, setBreakTime] = useState(() => parseInt(localStorage.getItem("breakTime")) || 5);
    const [timeLeft, setTimeLeft] = useState(workTime * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isWork, setIsWork] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks")) || []);
    const [showForm, setShowForm] = useState(false);
    const [showTasks, setShowTasks] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [taskDetails, setTaskDetails] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskWork, setTaskWork] = useState(workTime);
    const [taskBreak, setTaskBreak] = useState(breakTime);
    const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);

    const intervalRef = useRef(null);
    const audioRef = useRef(null);
    const bgMusicRef = useRef(null);

    // Hero Slideshow
    const images = [Heroimg1, Heroimg2, Heroimg3];
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Save times to localStorage
    useEffect(() => {
        localStorage.setItem("workTime", workTime);
        localStorage.setItem("breakTime", breakTime);
    }, [workTime, breakTime]);

    useEffect(() => {
        audioRef.current = new Audio("/bell.mp3");
    }, []);

    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = 0.2;
            bgMusicRef.current.play().catch(() => { });
        }
    }, []);

    // Timer countdown and automatic progress update
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        const nextIsWork = !isWork;
                        setIsWork(nextIsWork);

                        const nextTime = nextIsWork ? workTime * 60 : breakTime * 60;

                        if (!nextIsWork && selectedTaskIndex !== null) {
                            const updatedTasks = [...tasks];
                            const task = updatedTasks[selectedTaskIndex];
                            const completedWork = task.progress + (task.work / task.work) * 100;
                            task.progress = Math.min(100, completedWork);
                            setTasks(updatedTasks);
                        }

                        return nextTime;
                    }

                    if (isWork && selectedTaskIndex !== null) {
                        const updatedTasks = [...tasks];
                        const task = updatedTasks[selectedTaskIndex];
                        const totalSeconds = task.work * 60;
                        const passed = totalSeconds - prev + 1;
                        task.progress = Math.min(100, Math.floor((passed / totalSeconds) * 100));
                        setTasks(updatedTasks);
                    }

                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, isWork, workTime, breakTime, selectedTaskIndex, tasks]);

    useEffect(() => {
        if (isWork && timeLeft > 0 && timeLeft <= 10) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [timeLeft, isWork]);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    const handleAddTask = () => {
        if (!taskName) return;
        const newTask = {
            name: taskName,
            details: taskDetails,
            date: taskDate,
            work: parseInt(taskWork),
            break: parseInt(taskBreak),
            progress: 0,
        };
        setTasks([...tasks, newTask]);
        setShowForm(false);
        setTaskName("");
        setTaskDetails("");
        setTaskDate("");
        setTaskWork(workTime);
        setTaskBreak(breakTime);
    };

    const handleDeleteTask = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    const handleUpdateTask = (index) => {
        const t = tasks[index];
        setTaskName(t.name);
        setTaskDetails(t.details);
        setTaskDate(t.date);
        setTaskWork(t.work);
        setTaskBreak(t.break);
        setShowForm(true);
        handleDeleteTask(index);
    };

    const startTimer = () => setIsRunning(true);
    const pauseTimer = () => setIsRunning(false);
    const resetTimer = () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsWork(true);
        setTimeLeft(workTime * 60);
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    };
    const toggleMode = () => setDarkMode((prev) => !prev);

    const selectTask = (index) => {
        setSelectedTaskIndex(index);
        const t = tasks[index];
        setWorkTime(t.work);
        setBreakTime(t.break);
        setTimeLeft(t.work * 60);
        setShowTasks(false);
        setShowProgress(false);
    };

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    const totalTime = isWork ? workTime * 60 : breakTime * 60;
    const progressCircle = ((totalTime - timeLeft) / totalTime) * 2 * Math.PI * 100;
    let strokeColor = isWork ? "#3b82f6" : "#22c55e";
    if (isWork && timeLeft <= 10) strokeColor = "#ef4444";

    const bgColor = darkMode ? "bg-gray-900" : "bg-gray-100";
    const textColor = darkMode ? "text-white" : "text-black";
    const inputBg = darkMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black";
    const cardBg = darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black";

    const isHeartbeat = isWork && timeLeft <= 10;

    const messages = [
        "Everybody can Track their work.",
        "Set goals and work for them.",
        "Enjoy your Break.",
        "User Can view Task history."
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentMessage = messages[currentMessageIndex];
        let typingSpeed = isDeleting ? 50 : 100;

        const handleTyping = () => {
            if (!isDeleting && displayedText.length < currentMessage.length) {
                setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
            } else if (isDeleting && displayedText.length > 0) {
                setDisplayedText(currentMessage.slice(0, displayedText.length - 1));
            } else if (!isDeleting && displayedText.length === currentMessage.length) {
                setTimeout(() => setIsDeleting(true), 1000);
            } else if (isDeleting && displayedText.length === 0) {
                setIsDeleting(false);
                setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayedText, isDeleting, currentMessageIndex]);

    return (
        <>
            {/* === Hero Section with Slideshow === */}
            <div className="relative flex flex-col items-center justify-center h-screen text-center overflow-hidden">
                <img
                    src={images[currentIndex]}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-white/20"></div>
                <div className="relative z-20 flex flex-col items-center justify-center px-4 text-center">
                    <div className="w-full">
                        <h1 className="text-[90px] md:text-[140px] font-extrabold mb-6 text-white leading-tight">
                            Welcome to the <span className="text-blue-400">Pomodoro</span>
                        </h1>
                        <div className="min-h-[52px] text-3xl md:text-5xl text-gray-300">
                            {displayedText}
                        </div>
                    </div>
                </div>
            </div>

            {/* === Original Pomodoro Timer Section === */}
            <div className={`${bgColor} ${textColor} flex flex-col items-center justify-center min-h-screen p-4 font-[Poppins] relative transition-colors duration-500`}>
                {/* Background video */}
                <video
                    key={isWork ? "work" : "break"}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-500"
                    style={{ filter: darkMode ? "brightness(1.2)" : "brightness(0.3)" }}
                >
                    <source src={isWork ? "/src/images/work.mp4" : "/src/images/break.mp4"} type="video/mp4" />
                </video>

                {/* Dark/Light Mode & Task Buttons */}
                <div className="absolute top-4 right-4 z-20 flex space-x-2">
                    <button onClick={toggleMode} className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center">
                        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </button>
                    <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Add Task</button>
                    <button onClick={() => setShowTasks(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white">Your Tasks</button>
                    <button onClick={() => setShowProgress(true)} className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white">Progress</button>
                </div>

                {/* Card Wrapper */}
                <div className="relative rounded-2xl p-2 z-10 w-sm shadow-[0_0_40px_white] sm:w-lg mt-12">
                    <div
                        className={`rounded-2xl p-8 transition-colors duration-500 ${isWork
                                ? (darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-black") // Work: normal
                                : "bg-white/20 backdrop-blur-md border border-white/30 text-black"   // Break: frosted
                            }`}
                    >
                        <h1 className="text-5xl font-bold mb-2 text-center">
                            {isWork ? "Focus Flow" : "Break Time"}
                        </h1>
                        {selectedTaskIndex !== null && isWork && (
                            <h2 className="text-2xl mb-4 text-center">
                                Current Task: {tasks[selectedTaskIndex].name}
                            </h2>
                        )}

                        {/* Timer Circle */}
                        <div className="relative w-64 h-64 mb-8 mx-auto">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="100"
                                    stroke={isWork ? (darkMode ? "#555" : "#ccc") : "#ccc"}
                                    strokeWidth="15"
                                    fill="none"
                                />
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="100"
                                    stroke={strokeColor}
                                    strokeWidth="15"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 - progressCircle}
                                    strokeLinecap="round"
                                    className="transition-all duration-500 ease-linear"
                                />
                            </svg>
                            <motion.div
                                className="absolute inset-0 flex flex-col items-center justify-center"
                                animate={isHeartbeat ? { scale: [1, 1.2, 1] } : {}}
                                transition={isHeartbeat ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : {}}
                            >
                                <span className="text-5xl font-bold">{minutes}:{seconds}</span>
                                <span className="text-xl mt-2">{isWork ? "Work" : "Break"}</span>
                            </motion.div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex justify-center space-x-4 mb-4">
                            {!isRunning ? (
                                <button onClick={startTimer} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                    <FaPlay size={20} />
                                </button>
                            ) : (
                                <button onClick={pauseTimer} className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                                    <FaPause size={20} />
                                </button>
                            )}
                            <button onClick={resetTimer} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                <FaRedo size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audio */}
                <audio ref={audioRef} src="/bell.mp3" />

                 {/* Task Form */}
                {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                    className={`absolute top-20 right-4 z-30 p-6 rounded-lg shadow-lg transition-colors duration-300 ${cardBg} max-w-md`}
                >
                    <h2 className="text-2xl font-bold mb-4">Add / Update Task</h2>
                    <div className="flex flex-col space-y-3">
                    <input type="text" placeholder="Task Name" value={taskName} onChange={(e) => setTaskName(e.target.value)} className={`p-2 rounded w-full ${inputBg}`} />
                    <textarea placeholder="Task Details" value={taskDetails} onChange={(e) => setTaskDetails(e.target.value)} className={`p-2 rounded w-full ${inputBg}`} />
                    <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className={`p-2 rounded w-full ${inputBg}`} />
                    <div className="flex space-x-2">
                     <div className="flex space-x-2">
                        <div className="flex flex-col w-1/2">
                            <label className="mb-1 text-sm font-medium">Work (minutes)</label>
                            <input
                            type="number"
                            value={taskWork}
                            onChange={(e) => setTaskWork(e.target.value)}
                            className={`p-2 rounded w-full ${inputBg}`}
                            />
                        </div>

                        <div className="flex flex-col w-1/2">
                            <label className="mb-1 text-sm font-medium">Break (minutes)</label>
                            <input
                            type="number"
                            value={taskBreak}
                            onChange={(e) => setTaskBreak(e.target.value)}
                            className={`p-2 rounded w-full ${inputBg}`}
                            />
                        </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleAddTask} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transform hover:scale-105 transition-transform">Save</button>
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transform hover:scale-105 transition-transform">Cancel</button>
                    </div>
                    </div>
                </motion.div>
                )}

                {/* Tasks List */}
                {showTasks && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                    className={`absolute top-20 right-4 z-30 p-6 rounded-lg shadow-lg transition-colors duration-300 ${cardBg} max-w-2xl`}
                >
                    <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
                    {tasks.length === 0 ? (
                    <p>No tasks added yet.</p>
                    ) : (
                    tasks.map((task, index) => (
                        <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="border-b border-gray-400 dark:border-gray-600 py-2 mb-2 cursor-pointer"
                        >
                        <h3 className="font-bold">{task.name}</h3>
                        <p>{task.details}</p>
                        <p>Date: {task.date}</p>
                        <p>Work: {task.work} min | Break: {task.break} min</p>
                        <div className="flex space-x-2 mt-1">
                            <button onClick={() => selectTask(index)} className="px-2 py-1 bg-green-500 text-white rounded shadow-sm hover:scale-105 transform transition-transform">Start</button>
                            <button onClick={() => handleUpdateTask(index)} className="px-2 py-1 bg-yellow-500 text-white rounded shadow-sm hover:scale-105 transform transition-transform">Edit</button>
                            <button onClick={() => handleDeleteTask(index)} className="px-2 py-1 bg-red-500 text-white rounded shadow-sm hover:scale-105 transform transition-transform">Delete</button>
                        </div>
                        </motion.div>
                    ))
                    )}
                    <button onClick={() => setShowTasks(false)} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transform hover:scale-105 transition-transform">Close</button>
                </motion.div>
                )}

                {/* Progress Section */}
                {showProgress && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                    className={`absolute top-20 right-4 z-30 p-6 rounded-lg shadow-lg transition-colors duration-300 ${cardBg} max-w-2xl`}
                >
                    <h2 className="text-2xl font-bold mb-4">Tasks Progress</h2>
                    {tasks.length === 0 ? <p>No tasks available.</p> : (
                    tasks.map((task, index) => (
                        <motion.div
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        className="border-b border-gray-400 dark:border-gray-600 py-2 mb-2"
                        >
                        <h3 className="font-bold">{task.name}</h3>
                        <p>{task.details}</p>
                        <p>Date: {task.date}</p>
                        <div className="w-full bg-gray-300 rounded-full h-4 mt-1">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${task.progress}%` }}></div>
                        </div>
                        <p className="text-sm mt-1">Progress: {task.progress}%</p>
                        <div className="flex space-x-2 mt-1">
                            <button onClick={() => handleUpdateTask(index)} className="px-2 py-1 bg-yellow-500 text-white rounded shadow-sm hover:scale-105 transform transition-transform">Edit</button>
                            <button onClick={() => handleDeleteTask(index)} className="px-2 py-1 bg-red-500 text-white rounded shadow-sm hover:scale-105 transform transition-transform">Delete</button>
                        </div>
                        </motion.div>
                    ))
                    )}
                    <button onClick={() => setShowProgress(false)} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transform hover:scale-105 transition-transform">Close</button>
                </motion.div>
                )}
            </div>
        </>
    );
}
