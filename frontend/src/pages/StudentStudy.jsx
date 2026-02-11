import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Youtube, Brain, CheckCircle, Play, ChevronRight, Loader2, Sparkles } from 'lucide-react';

const StudentStudy = () => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, analyzing, completed
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const startAnalysis = () => {
        if (!file) return;
        setStatus('uploading');

        // Simulate Upload
        setTimeout(() => {
            setStatus('analyzing');
            // Simulate AI Analysis
            setTimeout(() => {
                generateMockResults();
                setStatus('completed');
            }, 2500);
        }, 1500);
    };

    const generateMockResults = () => {
        // Mock data based on file name simulation
        const isPhysics = file.name.toLowerCase().includes('physics');
        const isMath = file.name.toLowerCase().includes('math');

        setResults({
            summary: isPhysics
                ? "This document covers the fundamental principles of kinematics and dynamics. Key topics include Newton's Laws of Motion, conservation of energy, and momentum. The text emphasizes the relationship between force, mass, and acceleration, providing a comprehensive overview for introductory physics students."
                : "This document provides a detailed analysis of the subject matter. It breaks down complex core concepts into digestible sections, highlighting key definitions, theoretical frameworks, and practical applications suitable for academic study.",
            videos: [
                { id: 1, title: "Understanding The Core Concepts", channel: "CrashCourse", duration: "12:04", thumb: "https://img.youtube.com/vi/U7oEdvSAb7c/hqdefault.jpg" },
                { id: 2, title: "Deep Dive into Topic Analysis", channel: "Khan Academy", duration: "08:45", thumb: "https://img.youtube.com/vi/1xsqXxDrgQ4/hqdefault.jpg" },
                { id: 3, title: "Exam Prep and Key Questions", channel: "Organic Chemistry Tutor", duration: "15:30", thumb: "https://img.youtube.com/vi/bXzZ_d7e48I/hqdefault.jpg" }
            ],
            questions: [
                { q: "What is the primary law discussed in the introduction?", a: "The text focuses on the Law of Conservation of Energy." },
                { q: "How does the author define the relationship between variables?", a: "It is defined as a linear correlation where X implies Y." },
                { q: "Which case study is used to exemplify the theory?", a: "The bridge collapse of 1940 is used as a primary example." } // Specifics would come from real AI
            ]
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 to-indigo-600/90 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center opacity-30" />

                <div className="relative z-20 p-10 md:p-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-yellow-300" /> AI-Powered Study Companion
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Turn Your Notes into <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">Superpowers</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Upload your lecture notes, PDFs, or slides. Our AI will generate summaries, find relevant video tutorials, and create practice quizzes instantly.
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Upload & Status */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-violet-600" /> Upload Material
                        </h3>

                        <div className="border-2 border-dashed border-violet-100 rounded-2xl p-8 text-center hover:bg-violet-50/50 transition-colors cursor-pointer group relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <FileText className="w-8 h-8" />
                            </div>
                            <p className="text-gray-600 font-medium">
                                {file ? file.name : "Drag & drop files or click to browse"}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">Support for PDF, DOCX, TXT</p>
                        </div>

                        {file && status === 'idle' && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={startAnalysis}
                                className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" /> Analyze Now
                            </motion.button>
                        )}

                        {/* Progress State */}
                        {status !== 'idle' && status !== 'completed' && (
                            <div className="mt-8 text-center space-y-4">
                                <div className="w-16 h-16 mx-auto relative">
                                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">
                                        {status === 'uploading' ? 'Uploading Document...' : 'AI is Analyzing...'}
                                    </h4>
                                    <p className="text-gray-500 text-sm">
                                        {status === 'uploading' ? 'Please wait while we secure your file.' : 'Generating summaries and finding videos.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Stats / History could go here */}
                    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Brain className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">12</div>
                                <div className="text-violet-100 text-sm opacity-80">Documents Analyzed</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {status === 'completed' && results ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Summary Card */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5">
                                        <FileText className="w-32 h-32" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                        <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Sparkles className="w-5 h-5" /></span>
                                        AI Summary
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {results.summary}
                                    </p>
                                </div>

                                {/* Video Recommendations */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="p-2 bg-red-100 text-red-600 rounded-lg"><Youtube className="w-5 h-5" /></span>
                                        Curated Video Tutorials
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.videos.map((video) => (
                                            <a key={video.id} href="#" className="group block">
                                                <div className="relative rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all">
                                                    <img src={video.thumb} alt={video.title} className="w-full h-40 object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-110 transition-transform">
                                                            <Play className="w-4 h-4 text-gray-900 fill-current ml-0.5" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
                                                        {video.duration}
                                                    </div>
                                                </div>
                                                <h4 className="font-bold text-gray-800 leading-tight group-hover:text-violet-600 transition-colors">{video.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{video.channel}</p>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Questions / Quiz */}
                                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                                        Predicted Questions
                                    </h3>
                                    <div className="space-y-4">
                                        {results.questions.map((q, idx) => (
                                            <QuestionResult key={idx} question={q} index={idx + 1} />
                                        ))}
                                    </div>
                                </div>

                            </motion.div>
                        ) : status === 'idle' ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    <Upload className="w-16 h-16 text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-300">Ready to Analyze</h3>
                                <p className="text-gray-400 mt-2">Upload a document to get started</p>
                            </div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// Helper component for interactive questions
const QuestionResult = ({ question, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                    {index}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg">{question.q}</h4>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <p className="mt-3 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm font-medium border border-emerald-100">
                                    Answer: {question.a}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!isOpen && <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">Click to reveal answer</p>}
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>
        </div>
    );
};

export default StudentStudy;
