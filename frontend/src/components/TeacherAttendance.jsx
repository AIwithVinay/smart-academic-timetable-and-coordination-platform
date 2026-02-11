import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, X, Clock, Save, Search } from 'lucide-react';

const TeacherAttendance = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSection, setSelectedSection] = useState('A');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [courseId] = useState('CS101'); // Mock Course ID for now

    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate, selectedSection]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8001/attendance/${courseId}/${selectedDate}/${selectedSection}`);
            if (response.ok) {
                const data = await response.json();
                // If status is Pending, default to Present for easier marking
                const formatted = data.map(s => ({
                    ...s,
                    status: s.status === 'Pending' ? 'Present' : s.status
                }));
                setStudents(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setStudents(students.map(s =>
            s.student_id === id ? { ...s, status: newStatus } : s
        ));
    };

    const submitAttendance = async () => {
        const payload = students.map(s => ({
            student_id: s.student_id,
            course_id: courseId,
            date: selectedDate,
            status: s.status,
            section: selectedSection
        }));

        try {
            const response = await fetch('http://127.0.0.1:8001/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Attendance saved successfully!');
            } else {
                alert('Failed to save attendance.');
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert('Error saving attendance.');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-emerald-600" /> Mark Attendance
                    </h1>
                    <p className="text-gray-500">Manage daily attendance for your classes.</p>
                </div>

                <div className="flex gap-4 items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
                    />
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                    >
                        {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5">Student Name</div>
                    <div className="col-span-6 text-center">Status</div>
                </div>

                {/* Student List */}
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No students found in this section.</div>
                    ) : (
                        students.map((student, idx) => (
                            <motion.div
                                key={student.student_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors"
                            >
                                <div className="col-span-1 text-gray-400 font-medium">
                                    {idx + 1}
                                </div>
                                <div className="col-span-5 font-semibold text-gray-800">
                                    {student.name}
                                </div>
                                <div className="col-span-6 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleStatusChange(student.student_id, 'Present')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${student.status === 'Present'
                                            ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        Present
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(student.student_id, 'Absent')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${student.status === 'Absent'
                                            ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        Absent
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(student.student_id, 'Late')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${student.status === 'Late'
                                            ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500 ring-offset-1'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        Late
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={submitAttendance}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Save Attendance
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
