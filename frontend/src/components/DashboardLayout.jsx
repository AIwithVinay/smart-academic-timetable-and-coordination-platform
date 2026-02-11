import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    MessageSquare,
    CreditCard,
    AlertCircle,
    User,
    LogOut,
    Menu,
    X,
    Star,
    BookOpen,
    CheckCircle,
    Award
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, path, active, onClick, collapsed }) => {
    return (
        <motion.button
            whileHover={{
                x: 5,
                backgroundColor: "rgba(0,0,0,0.03)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative flex items-center w-full p-3 mb-2 rounded-xl transition-all duration-300 ${active
                ? 'text-white shadow-lg shadow-violet-200'
                : 'text-gray-500 hover:text-gray-800'
                }`}
        >
            {/* Active Background - Separated for Animation */}
            {active && (
                <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    style={{ zIndex: -1 }}
                />
            )}

            <div className={`flex items-center justify-center relative z-10 ${collapsed ? 'w-full' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
            </div>

            <AnimatePresence>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`ml-3 font-medium tracking-wide whitespace-nowrap relative z-10 ${active ? 'text-white' : ''}`}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

const DashboardLayout = ({ children, role = 'student' }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Use /student-dashboard as the base, but for specific items, we need to match exact paths or "starts with"
    // Since we are using nested routing, we should point to the correct sub-route.
    // However, the "Overview" is just "/student-dashboard".
    const basePath = role === 'faculty' ? '/faculty-dashboard' : role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
    const getPath = (sub) => sub === '' ? basePath : `${basePath}/${sub}`;

    const studentItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '' },
        { icon: BookOpen, label: 'AI Study Area', path: 'study' },
        { icon: Calendar, label: 'Timetable', path: 'timetable' },
        { icon: FileText, label: 'Assignments', path: 'assignments' },
        { icon: CheckCircle, label: 'Attendance', path: 'attendance' },
        { icon: Star, label: 'Grades', path: 'grades' },
        { icon: MessageSquare, label: 'Messages', path: 'messages' },
        { icon: CreditCard, label: 'Fees', path: 'fees' },
        { icon: AlertCircle, label: 'Complaints', path: 'complaints' },
        { icon: User, label: 'Profile', path: 'profile' },
        { icon: Award, label: 'Admit Card', path: 'admit-card' }, // Changed Icon to avoid duplicate User icon
    ];

    const facultySidebar = [
        { icon: LayoutDashboard, label: 'Overview', path: '' },
        { icon: BookOpen, label: 'My Classes', path: 'classes' },
        { icon: FileText, label: 'Assignments', path: 'assignments' },
        { icon: CheckCircle, label: 'Attendance', path: 'attendance' },
        { icon: Award, label: 'Grading', path: 'grading' },
        { icon: Calendar, label: 'Schedule', path: 'schedule' },
        { icon: MessageSquare, label: 'Messages', path: 'messages' },
        { icon: AlertCircle, label: 'Complaints', path: 'complaints' },
    ];

    const adminSidebar = [
        { icon: LayoutDashboard, label: 'Overview', path: '' },
        { icon: Calendar, label: 'Timetable', path: 'timetable' },
        { icon: CheckCircle, label: 'Attendance', path: 'attendance' },
        { icon: User, label: 'Users', path: 'users' },
        { icon: BookOpen, label: 'Subjects', path: 'subjects' },
    ];

    const menuItems = role === 'student' ? studentItems : role === 'faculty' ? facultySidebar : role === 'admin' ? adminSidebar : [];

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 260 }}
                animate={{ width: collapsed ? 90 : 260 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative h-full bg-white z-20 hidden md:flex flex-col border-r border-gray-100 shadow-xl shadow-gray-200/50"
            >
                {/* Logo Area */}
                <div className="p-6 flex items-center justify-between">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className={`w-9 h-9 bg-gradient-to-br ${role === 'faculty' ? 'from-orange-600 to-red-600 shadow-orange-200' : 'from-violet-600 to-indigo-600 shadow-indigo-200'} rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                    S
                                </div>
                                <span className="text-xl font-bold text-gray-800 tracking-tight">
                                    Smart<span className={`${role === 'faculty' ? 'text-orange-600' : 'text-violet-600'}`}>Dash</span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {menuItems.map((item) => {
                        const fullPath = getPath(item.path);
                        // Check active state strictly for root, or startsWith for others
                        const isActive = item.path === ''
                            ? location.pathname === fullPath || location.pathname === fullPath + '/'
                            : location.pathname.startsWith(fullPath);

                        return (
                            <SidebarItem
                                key={item.label}
                                {...item}
                                active={isActive}
                                collapsed={collapsed}
                                onClick={() => navigate(fullPath)}
                            />
                        );
                    })}
                </div>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-gray-100">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 group ${collapsed ? 'justify-center hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="ml-3 font-medium transition-colors">Logout</span>}
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">

                {/* Header for Mobile */}
                <div className="md:hidden p-4 bg-white border-b border-gray-100 flex justify-between items-center z-30 shadow-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <button className="text-gray-600"><Menu className="w-6 h-6" /></button>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 scroll-smooth">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
