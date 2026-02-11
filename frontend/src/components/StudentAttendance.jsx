import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const StudentAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            fetchAttendance();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchAttendance = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8001/student/attendance/${userId}`);
            if (response.ok) {
                const data = await response.json();
                // Sort by date descending
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAttendance(data);
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStats = () => {
        const total = attendance.length;
        if (total === 0) return { present: 0, absent: 0, late: 0, percent: 0 };
        const present = attendance.filter(a => a.status === 'Present').length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const late = attendance.filter(a => a.status === 'Late').length;
        return {
            present,
            absent,
            late,
            percent: ((present + late * 0.5) / total) * 100 // Late counts as half? or just present? Let's say Present only.
            // Simplified: Present / Total
        };
    };

    const stats = getStats();
    const percent = attendance.length > 0 ? (stats.present / attendance.length * 100).toFixed(1) : 0;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-blue-600" /> My Attendance
                    </h1>
                    <p className="text-gray-500">Track your daily attendance record.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">Total Classes</p>
                        <p className="text-xl font-bold text-gray-800">{attendance.length}</p>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">Attendance %</p>
                        <div className={`text-xl font-bold ${percent >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                            {percent}%
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-green-500" /> Present
                                </span>
                                <span className="font-bold text-gray-800">{stats.present}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-red-500" /> Absent
                                </span>
                                <span className="font-bold text-gray-800">{stats.absent}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" /> Late
                                </span>
                                <span className="font-bold text-gray-800">{stats.late}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            {percent < 75 && (
                                <div className="flex gap-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <p>Your attendance is below 75%. Please attend more classes to avoid detention.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div>Date</div>
                            <div>Course</div>
                            <div className="text-center">Status</div>
                            <div className="text-right">Action</div>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                            {attendance.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No attendance records found.</div>
                            ) : (
                                attendance.map((record) => (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50"
                                    >
                                        <div className="font-medium text-gray-800 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {record.date}
                                        </div>
                                        <div className="text-sm text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded w-fit">
                                            {record.course_id}
                                        </div>
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                                    record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {record.status === 'Present' && <CheckCircle className="w-3 h-3" />}
                                                {record.status === 'Absent' && <XCircle className="w-3 h-3" />}
                                                {record.status === 'Late' && <Clock className="w-3 h-3" />}
                                                {record.status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            {record.status === 'Absent' && (
                                                <button className="text-xs text-blue-600 hover:underline">Request Correction</button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;
