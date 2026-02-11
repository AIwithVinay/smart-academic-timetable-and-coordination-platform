import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, XCircle, Clock, User, AlertCircle } from 'lucide-react';

const TeacherComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (userId) {
            fetchComplaints();
        }
    }, [userId]);

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/faculty/complaints/${userId}`);
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

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/complaints/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Optimistic update
                setComplaints(prev => prev.map(c =>
                    c.id === id ? { ...c, status: newStatus } : c
                ));
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
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
                    <MessageSquare className="w-8 h-8 text-violet-600" /> Student Complaints
                </h1>
                <p className="text-gray-500 mt-2">Manage and resolve issues reported by students.</p>
            </header>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading complaints...</div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-100 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">All Good!</h3>
                        <p>No pending complaints assign directly to you.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {complaints.map(c => (
                            <motion.div
                                key={c.id}
                                layout
                                className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-6"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-violet-600 font-medium px-2 py-0.5 bg-violet-50 rounded">
                                            {c.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{c.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{c.description}</p>

                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-medium">
                                        <User className="w-3 h-3" /> Student ID: {c.student_id}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0">
                                    {c.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(c.id, 'Resolved')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:bg-green-700 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Resolve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(c.id, 'Dismissed')}
                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Dismiss
                                            </button>
                                        </>
                                    )}
                                    {c.status !== 'Pending' && (
                                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl text-gray-400 text-sm font-medium">
                                            start action taken
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherComplaints;
