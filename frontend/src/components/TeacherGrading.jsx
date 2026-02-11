import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Save, Upload, Download } from 'lucide-react';

const TeacherGrading = () => {
    const [selectedCourse, setSelectedCourse] = useState('CS101');
    const [selectedSection, setSelectedSection] = useState('A');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // We need a way to get students for grading. 
    // Since we don't have a dedicated endpoint API for "get students for grade", 
    // we will reuse the attendance logic or assume we can fetch attendance with a specific date to get students? 
    // BETTER: Let's assume we implement a helper to fetch students from the attendance endpoint logic 
    // or just fetch from /attendance/course/date/section with a dummy date to get the student list.
    // A bit hacky but works without new API. 
    // EDIT: I should probably have added a /students endpoint. 
    // For now, I'll try to fetch from attendance endpoint with today's date to get the list, 
    // and then fetch existing grades to overlay.

    useEffect(() => {
        fetchData();
    }, [selectedCourse, selectedSection]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get Student List (using attendance endpoint as a proxy for student list)
            const today = new Date().toISOString().split('T')[0];
            const studentResp = await fetch(`http://127.0.0.1:8001/attendance/${selectedCourse}/${today}/${selectedSection}`);
            if (!studentResp.ok) throw new Error("Failed to fetch students");
            const studentData = await studentResp.json();

            // 2. Get Existing Grades
            const gradesResp = await fetch(`http://127.0.0.1:8001/grades/${selectedCourse}`);
            let gradesMap = {};
            if (gradesResp.ok) {
                const gradesData = await gradesResp.json();
                gradesData.forEach(g => {
                    gradesMap[g.student_id] = g;
                });
            }

            // 3. Merge
            const merged = studentData.map(s => {
                const existing = gradesMap[s.student_id];
                return {
                    student_id: s.student_id,
                    name: s.name,
                    marks: existing ? existing.marks : '',
                    total_marks: existing ? existing.total_marks : 100,
                    grade: existing ? existing.grade : '',
                    comments: existing ? existing.comments : '',
                    is_published: existing ? existing.is_published : false
                };
            });

            setStudents(merged);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateGrade = (marks, total) => {
        const percentage = (marks / total) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'B+';
        if (percentage >= 75) return 'B';
        if (percentage >= 70) return 'C+';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    const handleMarkChange = (id, marks) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id === id) {
                const grade = calculateGrade(marks, s.total_marks);
                return { ...s, marks, grade };
            }
            return s;
        }));
    };

    const handleCommentChange = (id, comments) => {
        setStudents(prev => prev.map(s =>
            s.student_id === id ? { ...s, comments } : s
        ));
    };

    const saveGrades = async (publish = false) => {
        const payload = students.map(s => ({
            student_id: s.student_id,
            course_id: selectedCourse,
            marks: Number(s.marks),
            total_marks: Number(s.total_marks),
            grade: s.grade,
            comments: s.comments,
            is_published: publish
        })).filter(s => s.marks !== '');

        try {
            const response = await fetch('http://127.0.0.1:8001/grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(publish ? 'Grades published successfully!' : 'Grades saved as draft!');
                fetchData(); // Refresh to update published status
            } else {
                alert('Failed to save grades.');
            }
        } catch (error) {
            console.error("Error saving grades:", error);
            alert('Error saving grades.');
        }
    };

    const exportToCSV = () => {
        const headers = ["Student ID", "Name", "Marks", "Total", "Grade", "Comments"];
        const rows = students.map(s => [s.student_id, s.name, s.marks, s.total_marks, s.grade, s.comments]);

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += headers.join(",") + "\r\n";
        rows.forEach(row => {
            csvContent += row.join(",") + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Grades_${selectedCourse}_${selectedSection}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStats = () => {
        const validMarks = students.filter(s => s.marks !== '').map(s => Number(s.marks));
        if (validMarks.length === 0) return { avg: 0, max: 0, min: 0 };
        const sum = validMarks.reduce((a, b) => a + b, 0);
        return {
            avg: (sum / validMarks.length).toFixed(1),
            max: Math.max(...validMarks),
            min: Math.min(...validMarks)
        };
    };

    const stats = getStats();

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Award className="w-8 h-8 text-rose-600" /> Student Grading
                    </h1>
                    <p className="text-gray-500">Enter and manage student grades.</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="file"
                        id="csvUpload"
                        accept=".csv"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                                setLoading(true); // temporary loading state
                                const response = await fetch(`http://127.0.0.1:8001/grades/upload/${selectedCourse}`, {
                                    method: 'POST',
                                    body: formData
                                });

                                if (response.ok) {
                                    const data = await response.json();
                                    alert(data.message);
                                    fetchData();
                                } else {
                                    const errData = await response.json();
                                    console.error("Server Error:", errData);
                                    alert(`Failed to upload CSV: ${errData.detail || "Unknown error"}`);
                                }
                            } catch (error) {
                                console.error("Upload error:", error);
                                alert("Error uploading file");
                            } finally {
                                setLoading(false);
                                e.target.value = null; // reset input
                            }
                        }}
                    />
                    <button
                        onClick={() => document.getElementById('csvUpload').click()}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-medium transition-all flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" /> Upload CSV
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg outline-none focus:border-rose-500 bg-white"
                    >
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-center">
                    <p className="text-xs text-rose-600 font-bold uppercase">Class Average</p>
                    <p className="text-2xl font-bold text-rose-800">{stats.avg}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Highest Score</p>
                    <p className="text-2xl font-bold text-emerald-800">{stats.max}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs text-blue-600 font-bold uppercase">Lowest Score</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.min}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">Student Name</div>
                    <div className="col-span-2">Marks (100)</div>
                    <div className="col-span-1">Grade</div>
                    <div className="col-span-1">Calc</div>
                    <div className="col-span-4">Comments</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : students.map((student, idx) => (
                        <motion.div
                            key={student.student_id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50"
                        >
                            <div className="col-span-1 text-gray-400">{idx + 1}</div>
                            <div className="col-span-3 font-semibold text-gray-800">
                                {student.name}
                                {student.is_published && <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded uppercase font-bold">Published</span>}
                            </div>
                            <div className="col-span-2">
                                <input
                                    type="number"
                                    value={student.marks}
                                    onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-rose-500 outline-none"
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-span-1 font-bold text-gray-800">{student.grade}</div>
                            <div className="col-span-1">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${student.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                    student.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                        student.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                    {student.grade}
                                </span>
                            </div>
                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={student.comments}
                                    onChange={(e) => handleCommentChange(student.student_id, e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-rose-500 outline-none"
                                    placeholder="Add feedback..."
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={() => saveGrades(false)}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                        Save Draft
                    </button>
                    <button
                        onClick={() => saveGrades(true)}
                        className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Publish Grades
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherGrading;
