import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AdminTimetable from '../components/AdminTimetable';
import AdminUsers from '../components/AdminUsers';
import AdminSubjects from '../components/AdminSubjects';
import AdminAttendance from '../components/AdminAttendance';
import AdminComplaints from '../components/AdminComplaints';
import { motion } from 'framer-motion';
import { Users, BookOpen, UserPlus, Calendar, Settings } from 'lucide-react';

const AdminOverview = () => {
    const [stats, setStats] = React.useState({ students: 0, faculty: 0, subjects: 0 });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8001/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your institution's data and settings.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Students</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.students}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Total Faculty</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.faculty}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Courses</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.subjects}</p>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    return (
        <DashboardLayout role="admin">
            <Routes>
                <Route path="/" element={<AdminOverview />} />
                <Route path="/timetable" element={<AdminTimetable />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/subjects" element={<AdminSubjects />} />
                <Route path="/attendance" element={<AdminAttendance />} />
                <Route path="/complaints" element={<AdminComplaints />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AdminDashboard;
