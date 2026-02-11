import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, FileText, Calendar, Clock, CheckCircle } from 'lucide-react';
import TeacherClasses from '../components/TeacherClasses';
import TeacherAttendance from '../components/TeacherAttendance';
import TeacherGrading from '../components/TeacherGrading';
import TeacherSchedule from '../components/TeacherSchedule';
import TeacherAssignments from '../components/TeacherAssignments';
import TeacherMessages from '../components/TeacherMessages';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group`}
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 duration-500`}>
            <Icon className={`w-24 h-24 ${color.text}`} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${color.bg} ${color.text} bg-opacity-10`}>
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{label}</h4>
            <h3 className={`text-3xl font-bold mt-1 text-gray-800`}>{value}</h3>
        </div>
    </motion.div>
);

const TeacherOverview = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        classesToday: 0,
        pendingGrading: 0,
        attendanceTaken: "0/0"
    });
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const userId = localStorage.getItem('userId');
            // Fetch Schedule
            const schedRes = await fetch(`http://127.0.0.1:8001/schedule?faculty_id=${userId}`);

            if (schedRes.ok) {
                const schedule = await schedRes.json();

                // Calculate Classes Today
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todayClasses = schedule.filter(s => s.day_of_week === today);

                // Sort by time
                const sorted = todayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time));

                setStats(prev => ({
                    ...prev,
                    classesToday: todayClasses.length,
                    totalSchedule: schedule.length,
                    // Mocking other stats for now as backend endpoints might not exist yet
                    totalStudents: 120, // Placeholder
                    pendingGrading: 15, // Placeholder
                    attendanceTaken: `0/${todayClasses.length}`
                }));

                // Map to UI format
                setUpcomingClasses(sorted.map(s => ({
                    time: s.start_time,
                    subject: `${s.course_name} (Sec ${s.section})`,
                    room: `Room ${s.room}`,
                    status: 'Upcoming' // Logic to determine 'Next' vs 'Done' could be added
                })));
            }
        } catch (e) {
            console.error("Dashboard fetch failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <header className="mb-2">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-3xl font-bold text-gray-800 mb-2"
                >
                    Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">{localStorage.getItem('userName') || 'Professor'}</span>
                </motion.h1>
                <p className="text-gray-500">Here is your daily academic summary.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    label="Total Students"
                    value={stats.totalStudents}
                    color={{ text: 'text-orange-600', bg: 'bg-orange-600' }}
                />
                <StatCard
                    icon={Calendar}
                    label="Classes Today"
                    value={stats.classesToday}
                    color={{ text: 'text-blue-600', bg: 'bg-blue-600' }}
                />
                <StatCard
                    icon={FileText}
                    label="Pending Grading"
                    value={stats.pendingGrading}
                    color={{ text: 'text-rose-600', bg: 'bg-rose-600' }}
                />
                <StatCard
                    icon={CheckCircle}
                    label="Attendance Taken"
                    value={stats.attendanceTaken}
                    color={{ text: 'text-emerald-600', bg: 'bg-emerald-600' }}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Classes */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" /> Upcoming Classes (Today: {new Date().toLocaleDateString('en-US', { weekday: 'long' })})
                    </h2>
                    {/* Debug: Loaded {stats.classesToday} classes for today from {stats.totalSchedule || 0} total. */}
                    <div className="space-y-4">
                        {upcomingClasses.length === 0 ? (
                            <p className="text-gray-400 italic">No classes scheduled for today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })}).</p>
                        ) : (
                            upcomingClasses.map((cls, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-200 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="p-3 bg-white rounded-lg font-bold text-gray-700 shadow-sm border border-gray-100">
                                            {cls.time}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">{cls.subject}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-400" /> {cls.room}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls.status === 'Next' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {cls.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-200">
                    <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <button className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-left font-medium backdrop-blur-sm flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Post Assignment
                        </button>
                        <Link to="/faculty-dashboard/attendance" className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-left font-medium backdrop-blur-sm flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Mark Attendance
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Placeholders
const Classes = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">My Classes</h2><p className="text-gray-500 mt-2">Class management coming soon...</p></div>;
const Grading = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">Grading</h2><p className="text-gray-500 mt-2">Grading system coming soon...</p></div>;
const Schedule = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">Faculty Schedule</h2><p className="text-gray-500 mt-2">Schedule view coming soon...</p></div>;
const Messages = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">Messages</h2><p className="text-gray-500 mt-2">Chat system coming soon...</p></div>;

const TeacherDashboard = () => {
    return (
        <DashboardLayout role="faculty">
            <Routes>
                <Route path="/" element={<TeacherOverview />} />
                <Route path="classes" element={<TeacherClasses />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="grading" element={<TeacherGrading />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="schedule" element={<TeacherSchedule />} />
                <Route path="messages" element={<TeacherMessages />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/faculty-dashboard" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default TeacherDashboard;
