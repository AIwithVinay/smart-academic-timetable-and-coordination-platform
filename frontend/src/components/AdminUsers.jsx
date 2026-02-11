import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Search, Edit2, Save, X, Phone, Check } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'faculty'
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ parent_phone: '', full_name: '' });

    useEffect(() => {
        fetchUsers();
    }, [selectedRole]); // Re-fetch when role changes

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8001/users?role=${selectedRole}`);
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingId(user.id);
        setEditForm({
            parent_phone: user.parent_phone || '',
            full_name: user.full_name
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ parent_phone: '', full_name: '' });
    };

    const handleSave = async (userId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(users.map(u => u.id === userId ? updatedUser : u));
                setEditingId(null);
            } else {
                alert("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-500">Manage students and faculty members.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Role Toggles */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSelectedRole('student')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedRole === 'student' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setSelectedRole('faculty')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedRole === 'faculty' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Faculty
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
                        />
                    </div>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Phone</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading students...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No students found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-800">{user.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-sm">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                                                {user.section || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === user.id ? (
                                                <input
                                                    type="text"
                                                    value={editForm.parent_phone}
                                                    onChange={(e) => setEditForm({ ...editForm, parent_phone: e.target.value })}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                                                    placeholder="+1..."
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {user.parent_phone || <span className="text-gray-400 italic">Not set</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === user.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleSave(user.id)} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleEditClick(user)} className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
