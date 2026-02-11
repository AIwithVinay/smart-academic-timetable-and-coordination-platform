import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar, QrCode, Download } from 'lucide-react';

const AdmitCard = () => {
    const student = {
        name: "Alex Johnson",
        rollNo: "SAP-2024-001",
        course: "B.Tech Computer Science",
        semester: "VI",
        center: "Main Block, Hall A-203",
        examDate: "March 15, 2024",
        photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    };

    const subjects = [
        { code: "CS601", name: "Advanced Algorithms", date: "15 Mar", time: "10:00 AM" },
        { code: "CS602", name: "Computer Networks", date: "17 Mar", time: "10:00 AM" },
        { code: "CS603", name: "Artificial Intelligence", date: "19 Mar", time: "02:00 PM" },
        { code: "CS604", name: "Web Technologies", date: "21 Mar", time: "10:00 AM" },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 print:shadow-none"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-700 to-indigo-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider">ADMIT CARD</h1>
                        <p className="text-violet-200 text-sm">Spring Semester Examination 2024</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-lg">Smart Academic University</h2>
                        <p className="text-xs opacity-75">Excellence in Education</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* Student Details */}
                    <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
                        <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-gray-100 shrink-0 mx-auto md:mx-0">
                            <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" />
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Student Name</label>
                                <p className="font-bold text-gray-800 text-lg">{student.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Roll Number</label>
                                <p className="font-mono font-bold text-violet-600 text-lg">{student.rollNo}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Course</label>
                                <p className="font-medium text-gray-700">{student.course}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Semester</label>
                                <p className="font-medium text-gray-700">{student.semester}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Exam Center
                                </label>
                                <p className="font-medium text-gray-800">{student.center}</p>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col items-center justify-center pl-8 border-l border-gray-100">
                            <QrCode className="w-24 h-24 text-gray-800" />
                            <span className="text-[10px] text-gray-400 mt-2 tracking-widest">SCAN DETAILS</span>
                        </div>
                    </div>

                    {/* Subject Table */}
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-violet-600" /> Exam Schedule
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-gray-200 mb-8">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Code</th>
                                    <th className="px-6 py-3">Subject Name</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subjects.map((sub, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-mono text-gray-600 font-medium">{sub.code}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{sub.name}</td>
                                        <td className="px-6 py-4 text-violet-600 font-medium">{sub.date}</td>
                                        <td className="px-6 py-4 text-gray-600">{sub.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Instructions */}
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 mb-6">
                        <strong>Important Instructions:</strong>
                        <ul className="list-disc ml-4 mt-2 space-y-1 opacity-80">
                            <li>Candidates must carry this Admit Card and a valid Government ID proof.</li>
                            <li>Report to the exam center 30 minutes before the scheduled time.</li>
                            <li>Electronic gadgets are strictly prohibited inside the exam hall.</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg"
                    >
                        <Download className="w-5 h-5" /> Download / Print Hall Ticket
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdmitCard;
