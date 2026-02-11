import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, XCircle, Clock, User, Building, Filter, Search } from 'lucide-react';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Pending, Resolved
    const [targetFilter, setTargetFilter] = useState('All'); // All, Admin, Faculty

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/admin/complaints`);
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
                setComplaints(prev => prev.map(c =>
                    c.id === id ? { ...c, status: newStatus } : c
                ));
            }
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
            case 'dismissed': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const statusMatch = filter === 'All' || c.status === filter;
        const targetMatch = targetFilter === 'All' || c.target_type === targetFilter;
        return statusMatch && targetMatch;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-indigo-600" /> Complaint Management
                    </h1>
                    <p className="text-gray-500 mt-2">Oversee and resolve all student grievances.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Dismissed">Dismissed</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                        <Building className="w-4 h-4 text-gray-400" />
                        <select
                            value={targetFilter}
                            onChange={e => setTargetFilter(e.target.value)}
                            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none"
                        >
                            <option value="All">All Targets</option>
                            <option value="Admin">Admin Only</option>
                            <option value="Faculty">Faculty Only</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading complaints...</div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>No complaints found matching your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                    <th className="p-6 font-bold">Status</th>
                                    <th className="p-6 font-bold">Target</th>
                                    <th className="p-6 font-bold w-1/3">Issue</th>
                                    <th className="p-6 font-bold">Student</th>
                                    <th className="p-6 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredComplaints.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 align-top">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(c.status)}`}>
                                                {c.status}
                                            </span>
                                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-6 align-top">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                {c.target_type === 'Admin' ? <Building className="w-4 h-4 text-rose-500" /> : <User className="w-4 h-4 text-violet-500" />}
                                                {c.target_type}
                                            </div>
                                            {c.target_type === 'Faculty' && (
                                                <div className="text-xs text-gray-400 mt-1">ID: {c.target_fac_id}</div>
                                            )}
                                        </td>
                                        <td className="p-6 align-top">
                                            <h3 className="font-bold text-gray-800 mb-1">{c.title}</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed mb-2">{c.description}</p>
                                            <span className="text-xs text-indigo-600 font-medium px-2 py-0.5 bg-indigo-50 rounded">
                                                {c.category}
                                            </span>
                                        </td>
                                        <td className="p-6 align-top">
                                            <div className="text-sm font-medium text-gray-700">Student ID: {c.student_id}</div>
                                        </td>
                                        <td className="p-6 align-top text-right">
                                            {c.status === 'Pending' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => updateStatus(c.id, 'Resolved')}
                                                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                                        title="Mark Resolved"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(c.id, 'Dismissed')}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Action Taken
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminComplaints;
