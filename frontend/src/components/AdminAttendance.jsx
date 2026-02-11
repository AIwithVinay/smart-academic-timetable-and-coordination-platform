import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAttendance = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSection, setSelectedSection] = useState('A'); // Default to A
    const [schedule, setSchedule] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Schedule when Date or Section changes
    useEffect(() => {
        const fetchSchedule = async () => {
            const dateObj = new Date(selectedDate);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

            try {
                // Fetch full schedule for section (backend filters by section)
                const res = await fetch(`http://127.0.0.1:8001/schedule?section=${selectedSection}`);
                if (res.ok) {
                    const allData = await res.json();
                    // Filter by Day of Week
                    const daysSchedule = allData.filter(slot => slot.day === dayName);
                    setSchedule(daysSchedule);
                    setSelectedClass(null); // Reset selection
                    setAttendanceRecords([]);
                }
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            }
        };

        fetchSchedule();
    }, [selectedDate, selectedSection]);

    // Fetch Attendance when a Class is selected
    const handleClassClick = async (slot) => {
        setSelectedClass(slot);
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8001/attendance/${slot.subject}/${selectedDate}/${selectedSection}`);
            if (res.ok) {
                const data = await res.json();
                setAttendanceRecords(data);
            }
        } catch (error) {
            console.error("Failed to fetch attendance", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Attendance Monitoring</h1>
                    <p className="text-gray-500">View daily attendance for any section.</p>
                </div>

                <div className="flex gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                    >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-violet-500" />
                        Classes for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
                    </h3>

                    {schedule.length === 0 ? (
                        <p className="text-gray-500 italic">No classes scheduled.</p>
                    ) : (
                        schedule.map(slot => (
                            <motion.button
                                key={slot.id}
                                onClick={() => handleClassClick(slot)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedClass?.id === slot.id
                                        ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-200'
                                        : 'bg-white text-gray-800 border-gray-100 hover:border-violet-300'
                                    }`}
                            >
                                <div className="font-bold text-lg">{slot.subject}</div>
                                <div className={`text-sm ${selectedClass?.id === slot.id ? 'text-violet-100' : 'text-gray-500'}`}>
                                    {slot.start_time} - {slot.end_time}
                                </div>
                                <div className={`mt-2 text-xs font-medium px-2 py-1 rounded inline-block ${selectedClass?.id === slot.id ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {slot.faculty_name || 'No Faculty'}
                                </div>
                            </motion.button>
                        ))
                    )}
                </div>

                {/* Attendance List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">
                                {selectedClass ? `Attendance: ${selectedClass.subject}` : 'Select a class to view details'}
                            </h3>
                            {selectedClass && (
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                        <CheckCircle className="w-4 h-4" />
                                        {attendanceRecords.filter(r => r.status === 'Present').length} Present
                                    </span>
                                    <span className="flex items-center gap-1 text-red-600 font-medium">
                                        <XCircle className="w-4 h-4" />
                                        {attendanceRecords.filter(r => r.status === 'Absent').length} Absent
                                    </span>
                                </div>
                            )}
                        </div>

                        {!selectedClass ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Users className="w-12 h-12 mb-2 opacity-50" />
                                <p>Select a class from the list to view attendance.</p>
                            </div>
                        ) : loading ? (
                            <div className="p-8 text-center text-gray-500">Loading attendance...</div>
                        ) : attendanceRecords.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No attendance records found for this class.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {attendanceRecords.map(record => (
                                            <tr key={record.student_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-800">{record.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Present'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : record.status === 'Absent'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {record.status === 'Present' && <CheckCircle className="w-3 h-3" />}
                                                        {record.status === 'Absent' && <XCircle className="w-3 h-3" />}
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAttendance;
