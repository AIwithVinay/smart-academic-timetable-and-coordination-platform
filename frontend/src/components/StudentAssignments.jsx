import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('CS101');
    const [submissionContent, setSubmissionContent] = useState('');

    const studentId = 1; // Mock ID. Real app would fetch user context.
    const studentSection = 'H'; // Mock Section. Real app would fetch this.

    const courses = ['CS101', 'CS102'];

    useEffect(() => {
        fetchAssignments();
    }, [selectedCourse]);

    const fetchAssignments = async () => {
        try {
            // Fetch assignments for the course AND the specific section (or All)
            const res = await fetch(`http://127.0.0.1:8001/assignments/${selectedCourse}?section=${studentSection}`);
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    const handleSubmit = async (assignmentId) => {
        if (!submissionContent.trim()) return alert("Content cannot be empty");

        const payload = {
            assignment_id: assignmentId,
            student_id: studentId,
            content: submissionContent,
            submission_date: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };

        try {
            const res = await fetch('http://127.0.0.1:8001/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Submitted successfully!');
                setSubmissionContent('');
                // Verify/Refresh
            }
        } catch (error) {
            console.error("Error submitting:", error);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" /> My Assignments
                    </h1>
                </div>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg outline-none cursor-pointer"
                >
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </header>

            <div className="space-y-4">
                {assignments.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No assignments for this course.</div>
                ) : (
                    assignments.map(assign => (
                        <motion.div
                            key={assign.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{assign.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{assign.description}</p>
                                </div>
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Due: {assign.due_date}
                                </span>
                            </div>

                            {/* Submission Area */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Your Submission</label>
                                <textarea
                                    className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none text-sm"
                                    rows="3"
                                    placeholder="Type your answer or paste a link..."
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        onClick={() => handleSubmit(assign.id)}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" /> Submit
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentAssignments;
