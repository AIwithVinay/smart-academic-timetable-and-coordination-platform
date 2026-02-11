
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/student-dashboard/*" element={<StudentDashboard />} />
                <Route path="/faculty-dashboard/*" element={<TeacherDashboard />} />
                <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
