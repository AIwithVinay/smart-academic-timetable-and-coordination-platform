import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Calendar, CheckCircle } from 'lucide-react';

const TeacherAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('CS101');
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        due_date: '',
        target_section: 'All',
        course_id: 'CS101'
    });
    const [submissions, setSubmissions] = useState([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    const courses = ['CS101', 'CS102', 'CS201'];

    useEffect(() => {
        fetchAssignments();
    }, [selectedCourse]);

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/assignments/${selectedCourse}`);
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const payload = { ...newAssignment, course_id: selectedCourse, teacher_id: 1 }; // Mock teacher_id
        try {
            const res = await fetch('http://127.0.0.1:8001/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Assignment Created!');
                setShowForm(false);
                fetchAssignments();
                setNewAssignment({ title: '', description: '', due_date: '', target_section: 'All', course_id: selectedCourse });
            }
        } catch (error) {
            console.error("Error creating assignment:", error);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/submissions/${assignmentId}`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
                setSelectedAssignmentId(assignmentId);
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    const handleGrade = async (submissionId, grade, feedback) => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/submissions/${submissionId}/grade?grade=${grade}&feedback=${feedback}`, {
                method: 'PUT'
            });
            if (res.ok) {
                alert('Graded successfully');
                fetchSubmissions(selectedAssignmentId); // refresh
            }
        } catch (error) {
            console.error("Error grading:", error);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-600" /> Class Assignments
                    </h1>
                    <p className="text-gray-500">Manage assignments and grade submissions.</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg outline-none focus:border-indigo-500 bg-white"
                    >
                        {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Assignment
                    </button>
                </div>
            </header>

            {showForm && (
                <motion.form
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={handleCreate}
                >
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={newAssignment.title}
                            onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            rows="3"
                            value={newAssignment.description}
                            onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            required
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={newAssignment.due_date}
                            onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Section</label>
                        <select
                            className="w-full p-2 border border-gray-200 rounded-lg outline-none bg-white"
                            value={newAssignment.target_section}
                            onChange={e => setNewAssignment({ ...newAssignment, target_section: e.target.value })}
                        >
                            <option value="All">All Sections</option>
                            {['A', 'B', 'C', 'D', 'E', 'H'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                        </select>
                    </div>
                    <div className="flex items-end md:col-span-2">
                        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
                            Create Assignment
                        </button>
                    </div>
                </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* List of Assignments */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-700">Assignments</h2>
                    {assignments.map(assign => (
                        <div
                            key={assign.id}
                            onClick={() => fetchSubmissions(assign.id)}
                            className={`p-4 bg-white border border-gray-100 rounded-xl shadow-sm cursor-pointer hover:border-indigo-300 transition-all ${selectedAssignmentId === assign.id ? 'ring-2 ring-indigo-500' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800">{assign.title}</h3>
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {assign.due_date}
                                </span>
                            </div>
                            <div className="flex gap-2 mb-2">
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 uppercase font-bold">
                                    {assign.target_section === 'All' ? 'All Sections' : `Section ${assign.target_section}`}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{assign.description}</p>
                        </div>
                    ))}
                    {assignments.length === 0 && <p className="text-gray-400">No assignments yet.</p>}
                </div>

                {/* Submissions View */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-full overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">
                        {selectedAssignmentId ? 'Submissions' : 'Select an assignment to view submissions'}
                    </h2>

                    {selectedAssignmentId && (
                        <div className="space-y-4">
                            {submissions.length === 0 ? (
                                <p className="text-gray-400">No submissions yet.</p>
                            ) : (
                                submissions.map(sub => (
                                    <div key={sub.id} className="bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-gray-800">{sub.student_name}</span>
                                            <span className="text-xs text-gray-500">{sub.submission_date}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 mb-3 border border-gray-100">
                                            {sub.content}
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="number"
                                                placeholder="Grade (0-100)"
                                                className="w-24 p-1 border rounded"
                                                defaultValue={sub.grade}
                                                onBlur={(e) => handleGrade(sub.id, e.target.value, sub.feedback || '')}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Feedback"
                                                className="flex-1 p-1 border rounded"
                                                defaultValue={sub.feedback}
                                                onBlur={(e) => handleGrade(sub.id, sub.grade || 0, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAssignments;
