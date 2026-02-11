import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', code: '', credits: 3, preferred_rooms: [] });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8001/subjects');
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const handleAdd = async () => {
        if (!newSubject.name || !newSubject.code) return;
        try {
            const res = await fetch('http://127.0.0.1:8001/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubject)
            });
            if (res.ok) {
                fetchSubjects();
                setIsAdding(false);
                setNewSubject({ name: '', code: '', credits: 3, preferred_rooms: [] });
            }
        } catch (error) {
            console.error("Failed to add subject", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/subjects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSubjects(subjects.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete subject", error);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Subject Management</h1>
                    <p className="text-gray-500">Manage courses and credits.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Subject
                </button>
            </header>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Subject</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Subject Name (e.g. Adv Math)"
                            value={newSubject.name}
                            onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <input
                            type="text"
                            placeholder="Code (e.g. MTH101)"
                            value={newSubject.code}
                            onChange={e => setNewSubject({ ...newSubject, code: e.target.value })}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <input
                            type="number"
                            placeholder="Credits"
                            value={newSubject.credits}
                            onChange={e => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) })}
                            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handleAdd} className="flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
                            <Save className="w-4 h-4" /> Save Subject
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(subject => (
                    <div key={subject.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start">
                            <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => handleDelete(subject.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mt-4">{subject.name}</h3>
                        <p className="text-gray-500 font-mono text-sm mt-1">{subject.code}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                                {subject.credits} Credits
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSubjects;
