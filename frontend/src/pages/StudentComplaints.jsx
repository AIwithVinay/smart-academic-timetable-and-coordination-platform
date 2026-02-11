import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Building, AlertCircle, History, Send, Clock, CheckCircle, XCircle } from 'lucide-react';

const StudentComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [targetType, setTargetType] = useState('Admin'); // Admin, Faculty
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [category, setCategory] = useState('Academic');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const userId = localStorage.getItem('userId');

    const categories = {
        Admin: ['Hostel', 'Wifi', 'Mess', 'Facility', 'Other'],
        Faculty: ['Grading', 'Teaching Style', 'Behavior', 'Course Content', 'Other']
    };

    useEffect(() => {
        if (userId) {
            fetchComplaints();
            fetchFaculty();
        }
    }, [userId]);

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/complaints/my/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setComplaints(data);
            }
        } catch (err) {
            console.error("Failed to fetch complaints", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/users`);
            if (res.ok) {
                const data = await res.json();
                // Filter client side if endpoint returns all
                const faculty = data.filter(u => u.role === 'faculty');
                setFacultyList(faculty);
            }
        } catch (err) {
            console.error("Failed to fetch faculty", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            student_id: parseInt(userId),
            title,
            description,
            category,
            target_type: targetType,
            target_fac_id: targetType === 'Faculty' ? parseInt(selectedFaculty) : null,
            status: 'Pending'
        };

        try {
            const res = await fetch('http://127.0.0.1:8001/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowSuccess(true);
                setTitle('');
                setDescription('');
                fetchComplaints();
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                alert('Failed to submit complaint');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
            case 'dismissed': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-rose-500" /> Complaints & Issues
                </h1>
                <p className="text-gray-500 mt-2">Report issues directly to administration or faculty.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Complaint Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 h-fit"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" /> Report an Issue
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Target Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => { setTargetType('Admin'); setCategory(categories.Admin[0]); }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetType === 'Admin'
                                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                                        : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                    }`}
                            >
                                <Building className="w-6 h-6" />
                                <span className="font-bold text-sm">Administration</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setTargetType('Faculty'); setCategory(categories.Faculty[0]); }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetType === 'Faculty'
                                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                                        : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                    }`}
                            >
                                <User className="w-6 h-6" />
                                <span className="font-bold text-sm">Faculty</span>
                            </button>
                        </div>

                        {/* Faculty Dropdown */}
                        <AnimatePresence>
                            {targetType === 'Faculty' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Faculty Member</label>
                                    <select
                                        required
                                        value={selectedFaculty}
                                        onChange={e => setSelectedFaculty(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="">-- Choose Professor --</option>
                                        {facultyList.map(f => (
                                            <option key={f.id} value={f.id}>{f.full_name} ({f.email})</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-700"
                            >
                                {categories[targetType].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject / Title</label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Wifi not working in Library"
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                            <textarea
                                required
                                rows="4"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe the issue in detail..."
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit Complaint</>}
                        </button>

                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-2 font-medium"
                                >
                                    <CheckCircle className="w-5 h-5" /> Complaint submitted successfully!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* History */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-gray-400" /> Recent History
                    </h2>

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading history...</div>
                    ) : complaints.length === 0 ? (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No complaints filed yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {complaints.map((c, i) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 mb-1">{c.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2">{c.description}</p>

                                    <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                                            {c.target_type === 'Admin' ? (
                                                <><Building className="w-3 h-3" /> To: Administration</>
                                            ) : (
                                                <><User className="w-3 h-3" /> To: Faculty</>
                                            )}
                                        </div>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{c.category}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentComplaints;
