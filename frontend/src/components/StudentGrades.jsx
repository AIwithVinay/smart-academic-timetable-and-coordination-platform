import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';

const StudentGrades = () => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            fetchGrades();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchGrades = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8001/student/grades/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setGrades(data);
            }
        } catch (error) {
            console.error("Failed to fetch grades:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="w-12 h-12 mb-4 text-orange-400" />
                <h3 className="text-xl font-bold">User session not found</h3>
                <p>Please log in again.</p>
            </div>
        );
    }

    const calculateGPA = () => {
        if (grades.length === 0) return 0.0;
        let totalPoints = 0;
        grades.forEach(g => {
            if (g.grade.startsWith('A')) totalPoints += 4.0;
            else if (g.grade.startsWith('B')) totalPoints += 3.0;
            else if (g.grade.startsWith('C')) totalPoints += 2.0;
            else if (g.grade.startsWith('D')) totalPoints += 1.0;
        });
        return (totalPoints / grades.length).toFixed(2);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Award className="w-8 h-8 text-violet-600" /> Academic Performance
                    </h1>
                    <p className="text-gray-500">Track your grades and progress.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current GPA</p>
                        <p className="text-xl font-bold text-gray-800">{calculateGPA()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Loading grades...</div>
                ) : grades.length === 0 ? (
                    <div className="col-span-full p-10 bg-white rounded-3xl border border-gray-100 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-700">No grades yet</h3>
                        <p>Grades will appear here once your teachers publish them.</p>
                    </div>
                ) : (
                    grades.map((g, idx) => (
                        <motion.div
                            key={g.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Award className={`w-24 h-24 ${g.grade.startsWith('A') ? 'text-green-600' : 'text-blue-600'}`} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 rounded-lg bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest border border-gray-100">
                                        {g.course_id}
                                    </span>
                                    <span className={`text-2xl font-bold ${g.grade.startsWith('A') ? 'text-green-600' :
                                        g.grade.startsWith('B') ? 'text-blue-600' :
                                            g.grade.startsWith('C') ? 'text-yellow-600' : 'text-red-500'
                                        }`}>
                                        {g.grade}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-6 line-clamp-1">Course {g.course_id}</h3>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-sm text-gray-400 font-medium">Score</p>
                                        <p className="text-lg font-bold text-gray-700">{g.marks} <span className="text-sm text-gray-400 font-normal">/ {g.total_marks}</span></p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border-4 border-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">
                                        {(g.marks / g.total_marks * 100).toFixed(0)}%
                                    </div>
                                </div>

                                {g.comments && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-sm text-gray-500 italic">"{g.comments}"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentGrades;
