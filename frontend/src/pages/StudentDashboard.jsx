import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Activity, Award } from 'lucide-react';
import TimetableWidget from '../components/TimetableWidget';
// import AttendanceView from '../components/AttendanceView';

// Sub Components / Pages
import StudentGrades from '../components/StudentGrades';
import StudentAttendance from '../components/StudentAttendance';
import StudentAssignments from '../components/StudentAssignments';
import StudentFees from './StudentFees';
import StudentProfile from './StudentProfile';
import StudentMessages from '../components/StudentMessages';
import StudentComplaints from './StudentComplaints';
import StudentStudy from './StudentStudy';


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

const Overview = () => {
    // const navigate = useNavigate();
    const [notifications, setNotifications] = React.useState([]);
    const [stats, setStats] = React.useState({
        gpa: "0.0",
        attendance: "0%",
        active_courses: 0,
        credits: 0
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;
            try {
                const res = await fetch(`http://127.0.0.1:8001/student/stats/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch stats", e);
            }
        };

        fetchStats();

        // Load notifications and filter by section
        const storedStore = localStorage.getItem('classNotifications');
        const userSection = localStorage.getItem('userSection');

        if (storedStore) {
            const allNotes = JSON.parse(storedStore);
            // Filter: If no targetSections (legacy) OR targetSections includes userSection OR targetSections is empty/All
            const filtered = allNotes.filter(note => {
                if (!note.targetSections || note.targetSections.length === 0 || note.targetSections.includes('All')) return true;
                if (userSection && note.targetSections.includes(userSection)) return true;
                return false;
            });
            setNotifications(filtered);
        }
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome Section - ONLY on Overview */}
            <header className="mb-2">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-3xl font-bold text-gray-800 mb-2"
                >
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">{localStorage.getItem('userName') || 'Student'}</span>!
                </motion.h1>
                <p className="text-gray-500">Here's what's happening in your academic life today.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={BookOpen}
                    label="GPA"
                    value={stats.gpa}
                    color={{ text: 'text-emerald-600', bg: 'bg-emerald-600' }}
                />
                <StatCard
                    icon={Clock}
                    label="Attendance"
                    value={stats.attendance}
                    color={{ text: 'text-blue-600', bg: 'bg-blue-600' }}
                />
                <StatCard
                    icon={Activity}
                    label="Active Courses"
                    value={stats.active_courses}
                    color={{ text: 'text-violet-600', bg: 'bg-violet-600' }}
                />
                <StatCard
                    icon={Award}
                    label="Credits"
                    value={stats.credits}
                    color={{ text: 'text-pink-600', bg: 'bg-pink-600' }}
                />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-6"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-violet-500" /> Today's Schedule
                    </h2>
                    <div className="h-96">
                        <TimetableWidget />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Notifications</h2>
                        <div className="flex gap-2">
                            <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">{notifications.length} New</span>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => {
                                        setNotifications([]);
                                        localStorage.removeItem('classNotifications');
                                    }}
                                    className="text-white/70 hover:text-white text-xs hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-white/20">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10 opacity-60">
                                <p>No new notifications.</p>
                                <p className="text-xs mt-1">Updates from teachers will appear here.</p>
                            </div>
                        ) : (
                            notifications.map((note) => (
                                <div key={note.id} className="p-4 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-sm text-yellow-300">{note.courseName}</h4>
                                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/80">
                                            {note.targetSections && note.targetSections.length > 0
                                                ? `Sec ${note.targetSections.join(', ')}`
                                                : (!note.targetSection || note.targetSection === 'All' ? 'All Sections' : `Sec ${note.targetSection}`)
                                            }
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium mt-1 leading-snug">{note.message}</p>
                                    <div className="flex justify-between items-center mt-3 text-xs opacity-70 border-t border-white/10 pt-2">
                                        <span>{note.teacher}</span>
                                        <span>{note.date}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// Placeholder components for other routes
const Chat = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">Chat with Teachers</h2><p className="text-gray-500 mt-2">Coming soon...</p></div>;
const ReportCard = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">Report Card</h2><p className="text-gray-500 mt-2">Coming soon...</p></div>;
const AdmitCard = () => <div className="p-10 bg-white rounded-3xl shadow-sm"><h2 className="text-2xl font-bold text-gray-800">Admit Card</h2><p className="text-gray-500 mt-2">Coming soon...</p></div>;

const StudentDashboard = () => {
    return (
        <DashboardLayout role="student">
            <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/study" element={<StudentStudy />} />
                <Route path="/fees" element={<StudentFees />} />
                <Route path="/assignments" element={<StudentAssignments />} />
                <Route path="/grades" element={<StudentGrades />} />
                <Route path="/attendance" element={<StudentAttendance />} />
                <Route path="/messages" element={<StudentMessages />} />
                <Route path="/report-card" element={<ReportCard />} />
                <Route path="/timetable" element={<TimetableWidget />} />
                <Route path="/complaints" element={<StudentComplaints />} />
                <Route path="/admit-card" element={<AdmitCard />} />
                <Route path="/profile" element={<StudentProfile />} />
                <Route path="/study" element={<StudentStudy />} />
                <Route path="*" element={<Navigate to="/student-dashboard" replace />} />
            </Routes>
        </DashboardLayout>
    );
};

export default StudentDashboard;
