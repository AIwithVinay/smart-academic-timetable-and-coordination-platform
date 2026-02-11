import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Star, Bell, MessageCircle, X, Save } from 'lucide-react';

// Mock Data for the week
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const times = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

// Initial schedule removed, fetched from API

const TimetableWidget = () => {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [reminders, setReminders] = useState({});
    const [ratings, setRatings] = useState({});
    const [debugInfo, setDebugInfo] = useState({});

    React.useEffect(() => {
        const fetchSchedule = async () => {
            const section = localStorage.getItem('userSection');
            const role = localStorage.getItem('userRole');
            const userId = localStorage.getItem('userId');

            // console.log("TimetableWidget Debug:", { section, role, userId });
            setDebugInfo({ section, role, userId });

            let url = 'http://127.0.0.1:8001/schedule';
            const params = new URLSearchParams();
            if (section) params.append('section', section);

            try {
                const res = await fetch(`${url}?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    // Transform list to { Day: { Time: Class } }
                    const formatted = {};
                    data.forEach(item => {
                        if (!formatted[item.day_of_week]) formatted[item.day_of_week] = {};

                        // Helper to format time
                        const formatTime = (t) => {
                            const [h, m] = t.split(':');
                            let hour = parseInt(h);
                            let ampm = 'AM';

                            if (hour === 12) ampm = 'PM';
                            else if (hour >= 1 && hour <= 6) ampm = 'PM';
                            else if (hour >= 13) {
                                hour -= 12;
                                ampm = 'PM';
                            }

                            return `${hour.toString().padStart(2, '0')}:${m} ${ampm}`;
                        };

                        const timeKey = formatTime(item.start_time);
                        formatted[item.day_of_week][timeKey] = {
                            subject: item.course_name,
                            teacher: 'Faculty',
                            room: item.room,
                            color: 'bg-blue-100 text-blue-700'
                        };
                    });
                    setSchedule(formatted);
                }
            } catch (err) {
                console.error("Failed to load schedule", err);
            }
        };
        fetchSchedule();
    }, []);

    const handleSlotClick = (day, time, classInfo) => {
        setSelectedSlot({ day, time, ...classInfo });
    };

    const handleSaveReminder = (day, time, text) => {
        setReminders(prev => ({ ...prev, [`${day}-${time}`]: text }));
    };

    const handleRateTeacher = (teacher, rating) => {
        setRatings(prev => ({ ...prev, [teacher]: rating }));
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-violet-600" /> Class Schedule
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your weekly classes and reminders.</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                        <MessageCircle className="w-3 h-3" /> Note
                    </span>
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                        <Bell className="w-3 h-3" /> Reminder
                    </span>
                </div>
            </div>

            <div className="overflow-auto flex-1 p-6 relative">

                <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-2 overflow-x-auto pb-4 min-w-[800px]">
                    {/* Header Row */}
                    <div className="font-bold text-gray-400 text-sm bg-gray-50 rounded-lg flex items-center justify-center p-2">Time</div>
                    {days.map(day => (
                        <div key={day} className="font-bold text-gray-700 text-center bg-violet-50/50 rounded-xl p-3 border border-violet-100">
                            {day}
                        </div>
                    ))}

                    {/* Time Rows */}
                    {times.map(time => (
                        <React.Fragment key={time}>
                            <div className="text-gray-500 text-xs font-semibold flex items-center justify-center bg-gray-50 rounded-lg">
                                {time}
                            </div>
                            {days.map(day => {
                                const classInfo = schedule[day]?.[time];
                                const reminder = reminders[`${day}-${time}`];
                                return (
                                    <motion.div
                                        key={`${day}-${time}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => classInfo ? handleSlotClick(day, time, classInfo) : null}
                                        className={`
                                            min-h-[100px] rounded-xl p-3 border transition-all cursor-pointer relative group
                                            ${classInfo
                                                ? `${classInfo.color} border-transparent shadow-sm`
                                                : 'bg-white border-dashed border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {classInfo ? (
                                            <>
                                                <div className="font-bold text-sm leading-tight text-gray-800">{classInfo.subject}</div>
                                                <div className="text-xs text-gray-500 font-medium mt-1">{classInfo.teacher}</div>

                                                <div className="flex items-center gap-2 mt-3">
                                                    <div className="text-[10px] uppercase tracking-wider bg-white/50 px-2 py-0.5 rounded-md font-bold text-gray-600 border border-gray-100/50">
                                                        {classInfo.room}
                                                    </div>
                                                </div>

                                                {/* Action Indicators */}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    {/* Rating Star */}
                                                    {(ratings[classInfo.teacher] || 0) > 0 && (
                                                        <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full shadow-sm" title={`Rated ${ratings[classInfo.teacher]} stars`}>
                                                            <Star className="w-3 h-3 fill-current" />
                                                        </div>
                                                    )}

                                                    {/* Reminder Bell */}
                                                    {reminder && (
                                                        <div className="bg-amber-100 text-amber-600 p-1 rounded-full shadow-sm animate-pulse" title="Reminder Set">
                                                            <Bell className="w-3 h-3 fill-current" />
                                                        </div>
                                                    )}

                                                    {/* Note Icon */}
                                                    {classInfo.note && (
                                                        <div className="bg-blue-100 text-blue-600 p-1 rounded-full shadow-sm" title="Teacher Note">
                                                            <MessageCircle className="w-3 h-3 fill-current" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bottom Bar for Reminder Text preview if space permits, or just subtle highlight */}
                                                {reminder && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-b-xl" />
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-5 h-5 text-gray-300" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Modal for detail view */}
            <AnimatePresence>
                {selectedSlot && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
                        onClick={() => setSelectedSlot(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Decorative Background */}
                            <div className={`absolute top-0 left-0 w-full h-24 ${selectedSlot.color.split(' ')[0]} opacity-50`} />

                            <button
                                onClick={() => setSelectedSlot(null)}
                                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>

                            <div className="relative pt-10 mb-6">
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-gray-500">
                                    {selectedSlot.day} • {selectedSlot.time}
                                </span>
                                <h2 className="text-3xl font-bold text-gray-800 mt-2">{selectedSlot.subject}</h2>
                                <p className="text-lg text-gray-600">{selectedSlot.teacher}</p>
                            </div>

                            <div className="space-y-6">
                                {/* Teacher Note */}
                                {selectedSlot.note && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                        <MessageCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-800">Teacher's Note</h4>
                                            <p className="text-sm text-blue-600 mt-1">{selectedSlot.note}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Reminder Input */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                        <Bell className="w-4 h-4 text-amber-500" /> Set Personal Reminder
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. Bring assignment..."
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            defaultValue={reminders[`${selectedSlot.day}-${selectedSlot.time}`] || ''}
                                            id="reminderInput"
                                        />
                                        <button
                                            onClick={() => {
                                                const val = document.getElementById('reminderInput').value;
                                                handleSaveReminder(selectedSlot.day, selectedSlot.time, val);
                                                setSelectedSlot(null);
                                            }}
                                            className="bg-gray-900 text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
                                        >
                                            <Save className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Teacher Rating */}
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                        <Star className="w-4 h-4 text-yellow-500" /> Rate Class/Teacher
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => handleRateTeacher(selectedSlot.teacher, star)}
                                                className={`p-1 transition-transform hover:scale-110 ${(ratings[selectedSlot.teacher] || 0) >= star
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimetableWidget;
