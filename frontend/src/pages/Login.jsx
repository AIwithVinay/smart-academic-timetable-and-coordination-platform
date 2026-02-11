import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, GraduationCap, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [animate, setAnimate] = useState(true);

    // Trigger animation when role changes
    useEffect(() => {
        setAnimate(false);
        setTimeout(() => setAnimate(true), 50);
    }, [role]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Use navigate for client-side routing
                // Store user details for all roles
                localStorage.setItem('userSection', data.section || '');
                localStorage.setItem('userName', data.full_name || '');
                localStorage.setItem('userId', data.id || '');
                localStorage.setItem('userRole', data.role || '');

                if (data.role === 'admin') navigate('/admin-dashboard');
                else if (data.role === 'faculty') navigate('/faculty-dashboard');
                else navigate('/student-dashboard');
            } else {
                const errorMessage = typeof data.detail === 'string'
                    ? data.detail
                    : JSON.stringify(data.detail);
                alert(errorMessage || "Login failed");
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Network error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = () => {
        switch (role) {
            case 'admin': return <Shield className="w-12 h-12 text-white" />;
            case 'faculty': return <User className="w-12 h-12 text-white" />;
            default: return <GraduationCap className="w-12 h-12 text-white" />;
        }
    };

    const getRoleColor = () => {
        switch (role) {
            case 'admin': return 'bg-rose-600';
            case 'faculty': return 'bg-indigo-600';
            default: return 'bg-emerald-600';
        }
    };

    const getGradient = () => {
        switch (role) {
            case 'admin': return 'from-rose-800 to-red-900';
            case 'faculty': return 'from-indigo-800 to-blue-900';
            default: return 'from-emerald-800 to-green-900';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex overflow-hidden min-h-[600px]">

                {/* Left Side - Dynamic Visuals */}
                <div className={`hidden md:flex md:w-1/2 p-12 flex-col justify-center items-center text-white relative transition-colors duration-700 ease-in-out bg-gradient-to-br ${getGradient()}`}>

                    {/* Animated Content */}
                    <div className={`flex flex-col items-center text-center transform transition-all duration-700 ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg bg-white/20 backdrop-blur-md`}>
                            {getRoleIcon()}
                        </div>

                        <h2 className="text-4xl font-bold mb-4 tracking-tight">
                            {role === 'student' && 'Student Portal'}
                            {role === 'faculty' && 'Faculty Access'}
                            {role === 'admin' && 'Admin Console'}
                        </h2>

                        <p className="text-blue-100 text-lg max-w-sm font-light leading-relaxed opacity-90">
                            {role === 'student' && 'Your academic journey, streamlined. Access grades, schedules, and resources.'}
                            {role === 'faculty' && 'Manage courses, attendance, and student progress efficiently.'}
                            {role === 'admin' && 'Centralized control for institutional data and platform settings.'}
                        </p>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-14 bg-white flex flex-col justify-center relative">

                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Academic Platform</h3>
                            <p className="text-gray-500 text-sm">Sign in to your institutional account</p>
                        </div>

                        {/* Role Tabs */}
                        <div className="bg-gray-100 p-1.5 rounded-xl flex mb-8">
                            {['student', 'faculty', 'admin'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${role === r
                                        ? 'bg-white text-gray-900 shadow-sm transform scale-[1.02]'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-1">Institutional Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                                        placeholder="id@university.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-opacity-50 transform active:scale-[0.98] transition-all duration-200 ${role === 'admin' ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-200' :
                                    role === 'faculty' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200' :
                                        'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4" />
                            <span>Having trouble? <a href="#" className="text-gray-700 hover:underline font-medium">Contact IT Support</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;