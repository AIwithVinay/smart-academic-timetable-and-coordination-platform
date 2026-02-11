import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Save, AlertCircle, CheckCircle } from 'lucide-react';

const StudentProfile = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        parent_phone: '',
        section: ''
    });

    useEffect(() => {
        // Fetch current user details
        // Since we don't have a dedicated /me endpoint that returns everything,
        // we might need to rely on localStorage or a new fetch.
        // For now, let's assume we can fetch basic info or rely on what we have.
        // Actually, let's just fetch the /student/profile (PUT) response concept 
        // or just use local storage for name/email and blank for phone if not stored.

        // Better: We added a backend endpoint but not a GET for profile specifically?
        // Let's implement a GET fetch or just mock the initial load if we can't fetch.
        // Actually, we can assume the user knows their phone if they entered it, 
        // but to show it, we need to fetch. 
        // Let's TRY to fetch from a new endpoint or just show empty.

        const name = localStorage.getItem('userName');
        const email = localStorage.getItem('userEmail');
        const section = localStorage.getItem('userSection');

        setProfile(p => ({
            ...p,
            full_name: name || '',
            email: email || '',
            section: section || ''
        }));

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`http://127.0.0.1:8001/student/profile?user_id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parent_phone: profile.parent_phone,
                    full_name: profile.full_name
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSuccess('Profile updated successfully!');
                // Update local storage if name changed
                localStorage.setItem('userName', data.user.full_name);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <User className="w-8 h-8 text-violet-600" /> Student Profile
                </h1>
                <p className="text-gray-500 mt-2">Manage your personal information and communication preferences.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Read Only Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                            <input
                                type="text"
                                value={profile.section}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 my-6 pt-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-violet-500" /> Parent Communication
                        </h3>
                        <div className="bg-violet-50 p-4 rounded-xl mb-4 text-violet-800 text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>
                                Providing a valid parent phone number allows the institution to send important academic updates,
                                including report cards and performance alerts, directly to your parents via SMS/WhatsApp.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Parent Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={profile.parent_phone}
                                    onChange={e => setProfile({ ...profile, parent_phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 rounded-xl bg-green-50 text-green-600 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> {success}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
                        >
                            {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default StudentProfile;
