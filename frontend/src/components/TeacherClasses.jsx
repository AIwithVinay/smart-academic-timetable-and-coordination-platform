import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, Send, Archive, ChevronRight, Bell, Upload } from 'lucide-react';

const TeacherClasses = () => {
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSections, setSelectedSections] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [notifications, setNotifications] = useState([]);

    // Reset sections when class changes
    useEffect(() => {
        if (selectedClass) {
            setSelectedSections(selectedClass.sections || []); // Default to all
        }
    }, [selectedClass]);

    // Fetch Classes from API
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const userId = localStorage.getItem('userId');
                // We'll use the /schedule endpoint as a proxy to find what classes they teach
                // Ideally we should have a /allocations endpoint, but /schedule works if generated
                const response = await fetch(`http://127.0.0.1:8001/schedule?faculty_id=${userId}`);
                if (response.ok) {
                    const data = await response.json();

                    // Group by Course/Section to make a unique list of "Classes"
                    // Example: CS101-SecA, CS101-SecB
                    const uniqueClasses = {};
                    data.forEach(item => {
                        const key = `${item.course_id}-${item.section}`;
                        if (!uniqueClasses[key]) {
                            uniqueClasses[key] = {
                                id: item.course_id,
                                name: item.course_name,
                                students: 0, // Mock, or fetch from student count
                                time: item.day_of_week + ' ' + item.start_time, // Just show first slot found
                                room: item.room,
                                section: item.section,
                                sections: [item.section] // Keeping structure compatible
                            };
                        }
                    });

                    setClasses(Object.values(uniqueClasses));
                    if (Object.values(uniqueClasses).length > 0) {
                        setSelectedClass(Object.values(uniqueClasses)[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();
    }, []);

    const [classes, setClasses] = useState([]);

    // Load existing notifications on mount
    useEffect(() => {
        const stored = localStorage.getItem('classNotifications');
        if (stored) {
            setNotifications(JSON.parse(stored));
        }
    }, []);

    const handlePostAnnouncement = () => {
        if (!announcement.trim() || !selectedClass) return;

        const newNotification = {
            id: Date.now(),
            courseName: selectedClass.name,
            targetSections: selectedSections, // Critical for targeting
            message: announcement,
            date: new Date().toLocaleDateString(),
            teacher: 'Prof. Smith', // Mock teacher name
            read: false
        };

        const updated = [newNotification, ...notifications];
        setNotifications(updated);
        localStorage.setItem('classNotifications', JSON.stringify(updated));

        setAnnouncement('');
        alert(`Announcement posted to ${selectedClass.name} (Sections: ${selectedSections.join(', ')})!`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
            {/* Left Col: Class List */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-orange-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-600" /> My Classes
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Select a class to manage or post updates.</p>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {classes.map(cls => (
                        <motion.div
                            key={cls.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedClass(cls)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedClass?.id === cls.id
                                ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200'
                                : 'bg-white border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-sm">{cls.name}</h3>
                                    <p className={`text-xs mt-1 ${selectedClass?.id === cls.id ? 'text-orange-100' : 'text-gray-500'}`}>
                                        {cls.id} • {cls.room}
                                    </p>
                                </div>
                                <ChevronRight className={`w-5 h-5 ${selectedClass?.id === cls.id ? 'text-white' : 'text-gray-300'}`} />
                            </div>
                            <div className={`mt-3 flex items-center gap-2 text-xs font-medium ${selectedClass?.id === cls.id ? 'text-orange-100' : 'text-gray-400'}`}>
                                <Users className="w-3 h-3" /> {cls.students} Students
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Right Col: Class Details & Actions */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <AnimatePresence mode="wait">
                    {selectedClass ? (
                        <motion.div
                            key={selectedClass.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 flex-1 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedClass.name}</h2>
                                    <p className="text-gray-500">{selectedClass.time} • Room {selectedClass.room}</p>
                                </div>
                                <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-bold text-sm">
                                    Active Session
                                </div>
                            </div>

                            {/* Announcement Section */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6 relative z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-orange-600" /> Post Announcement
                                    </h3>
                                    <label className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                                        <Upload className="w-3 h-3" /> Upload Students
                                        <input
                                            type="file"
                                            accept=".csv, .xlsx"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                const formData = new FormData();
                                                formData.append('file', file);

                                                try {
                                                    // alert('Uploading ' + file.name + '...');
                                                    const response = await fetch('http://127.0.0.1:8001/upload-students', {
                                                        method: 'POST',
                                                        body: formData,
                                                    });
                                                    const data = await response.json();
                                                    alert(data.message);
                                                } catch (error) {
                                                    console.error('Upload failed:', error);
                                                    alert('Upload failed. Please try again.');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <textarea
                                    value={announcement}
                                    onChange={(e) => setAnnouncement(e.target.value)}
                                    placeholder={`Write an update for ${selectedClass.name} students...`}
                                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none bg-white font-medium text-gray-700"
                                />
                                <div className="mt-4 relative">
                                    <span className="text-xs text-gray-500 font-bold uppercase mb-2 block">Post For:</span>

                                    {/* Custom Dropdown Trigger */}
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white flex justify-between items-center hover:border-orange-300 transition-colors"
                                    >
                                        <span className="text-sm font-medium text-gray-700">
                                            {selectedSections.length === 0
                                                ? 'Select sections...'
                                                : selectedSections.length === selectedClass.sections.length
                                                    ? 'All Sections'
                                                    : `Sections: ${selectedSections.join(', ')}`}
                                        </span>
                                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 z-20 overflow-hidden"
                                            >
                                                <div className="p-2 border-b border-gray-100 flex justify-between bg-gray-50">
                                                    <button
                                                        onClick={() => setSelectedSections(selectedClass.sections)}
                                                        className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2 py-1 rounded hover:bg-orange-100"
                                                    >
                                                        Select All
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedSections([])}
                                                        className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                                    >
                                                        Deselect All
                                                    </button>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                                                    {selectedClass.sections?.map(sec => (
                                                        <label
                                                            key={sec}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSections.includes(sec)
                                                                ? 'bg-orange-600 border-orange-600 text-white'
                                                                : 'bg-white border-gray-300'
                                                                }`}>
                                                                {selectedSections.includes(sec) && <Users className="w-3 h-3" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={selectedSections.includes(sec)}
                                                                onChange={() => {
                                                                    if (selectedSections.includes(sec)) {
                                                                        setSelectedSections(selectedSections.filter(s => s !== sec));
                                                                    } else {
                                                                        setSelectedSections([...selectedSections, sec].sort());
                                                                    }
                                                                }}
                                                            />
                                                            <span className="text-sm font-medium text-gray-700">Section {sec}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                                    <p className="text-xs text-gray-400">
                                        Posting to: <span className="font-bold text-gray-600">{selectedSections.length > 0 ? selectedSections.join(', ') : 'None'}</span>
                                    </p>
                                    <button
                                        onClick={handlePostAnnouncement}
                                        disabled={!announcement.trim() || selectedSections.length === 0}
                                        className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
                                    >
                                        <Send className="w-4 h-4" /> Post Update
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity / History */}
                            <div className="flex-1 overflow-y-auto mt-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Archive className="w-4 h-4 text-gray-400" /> Recent Announcements
                                </h3>
                                <div className="space-y-3">
                                    {notifications.filter(n => n.courseName === selectedClass.name).length === 0 ? (
                                        <p className="text-gray-400 text-sm italic">No announcements posted yet.</p>
                                    ) : (
                                        notifications
                                            .filter(n => n.courseName === selectedClass.name)
                                            .map(note => (
                                                <div key={note.id} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-orange-100 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-gray-800 font-medium">{note.message}</p>
                                                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                                            Sec {note.targetSections ? note.targetSections.join(', ') : 'All'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2">Posted on {note.date}</p>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="font-medium">Select a class from the left to manage it.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TeacherClasses;
