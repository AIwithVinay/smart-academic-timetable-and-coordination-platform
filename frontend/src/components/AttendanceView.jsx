import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const subjects = [
    { name: 'Physics', attended: 24, total: 26, color: 'text-blue-600', bar: 'bg-blue-600' },
    { name: 'Mathematics', attended: 20, total: 25, color: 'text-emerald-600', bar: 'bg-emerald-600' },
    { name: 'Chemistry', attended: 18, total: 20, color: 'text-purple-600', bar: 'bg-purple-600' },
    { name: 'Computer Science', attended: 28, total: 30, color: 'text-indigo-600', bar: 'bg-indigo-600' },
    { name: 'English', attended: 15, total: 15, color: 'text-orange-600', bar: 'bg-orange-600' },
    { name: 'History', attended: 10, total: 12, color: 'text-rose-600', bar: 'bg-rose-600' },
];

const AttendanceCard = ({ subject, index }) => {
    const percentage = Math.round((subject.attended / subject.total) * 100);
    const isLow = percentage < 75;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{subject.name}</h3>
                    <p className="text-gray-500 text-sm">{subject.attended}/{subject.total} Classes Attended</p>
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${isLow ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}`}>
                    {percentage}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${isLow ? 'bg-red-500' : subject.bar}`}
                />
            </div>

            <div className="flex items-center gap-2 text-xs">
                {isLow ? (
                    <span className="text-red-500 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Low Attendance Warning
                    </span>
                ) : (
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" /> On Track
                    </span>
                )}
            </div>
        </motion.div>
    );
};

const AttendanceView = () => {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <PieChart className="w-8 h-8 text-blue-600" /> Attendance Report
                </h1>
                <p className="text-gray-500">Detailed breakdown of your attendance across all subjects.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub, idx) => (
                    <AttendanceCard key={sub.name} subject={sub} index={idx} />
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mt-8">
                <h3 className="font-bold text-blue-800 mb-2">Attendance Policy</h3>
                <p className="text-blue-700 text-sm">
                    Students must maintain a minimum of <strong>75% attendance</strong> in each subject to be eligible for the final examinations.
                    Please contact the administration if you have medical reasons for absence.
                </p>
            </div>
        </div>
    );
};

export default AttendanceView;
