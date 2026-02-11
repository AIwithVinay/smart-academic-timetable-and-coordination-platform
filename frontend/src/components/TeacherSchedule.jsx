import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherSchedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        try {
            const facultyId = localStorage.getItem('userId');
            const response = await fetch(`http://127.0.0.1:8001/schedule?faculty_id=${facultyId}`);
            if (response.ok) {
                const data = await response.json();
                setSchedule(data);
            }
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        } finally {
            setLoading(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-orange-600" /> Faculty Schedule
                </h1>
                <p className="text-gray-500">Your weekly class timetable.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {days.map((day, dayIdx) => {
                    const dayClasses = schedule.filter(s => s.day_of_week === day);
                    return (
                        <div key={day} className="flex flex-col gap-4">
                            <h3 className="font-bold text-gray-700 text-lg border-b border-gray-200 pb-2">{day}</h3>
                            <div className="space-y-3">
                                {dayClasses.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center text-gray-400 text-sm">
                                        No classes
                                    </div>
                                ) : (
                                    dayClasses.map((cls, idx) => (
                                        <motion.div
                                            key={cls.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 + dayIdx * 0.05 }}
                                            className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold px-2 py-1 rounded bg-orange-100 text-orange-700">
                                                    {cls.course_id}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 mb-1">{cls.course_name}</h4>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                <Clock className="w-3 h-3" />
                                                {cls.start_time} - {cls.end_time}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                {cls.room}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeacherSchedule;
