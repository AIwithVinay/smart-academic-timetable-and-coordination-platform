import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Play, CheckCircle, Calendar, Clock, MapPin, Search, AlertCircle, LayoutGrid, List } from 'lucide-react';

const SetupTab = () => {
    const [rooms, setRooms] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8001/rooms').then(r => r.json()).then(setRooms);
        fetch('http://127.0.0.1:8001/subjects').then(r => r.json()).then(setSubjects);
        fetch('http://127.0.0.1:8001/timeslots').then(r => r.json()).then(setSlots);
    }, []);

    const addRoom = async () => {
        const name = prompt("Room Name:");
        if (!name) return;
        await fetch('http://127.0.0.1:8001/rooms', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, capacity: 60 })
        });
        fetch('http://127.0.0.1:8001/rooms').then(r => r.json()).then(setRooms);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rooms Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Rooms</h3>
                        <p className="text-gray-400 text-sm">Manage physical spaces.</p>
                    </div>
                    <button onClick={addRoom} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                        <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {rooms.map(r => (
                        <span key={r.id} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-full text-sm font-medium border border-gray-100">
                            {r.name} <span className="opacity-50 text-xs ml-1">{r.capacity}</span>
                        </span>
                    ))}
                    {rooms.length === 0 && <span className="text-gray-300 italic text-sm">No rooms added.</span>}
                </div>
            </div>

            {/* Time Slots (Read Only for now as seeded) */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Time Slots</h3>
                    <p className="text-gray-400 text-sm">Defined teaching periods.</p>
                </div>
                <div className="space-y-2">
                    {/* Unique slots logic */}
                    {Array.from(new Set(slots.map(s => `${s.start_time} - ${s.end_time}`))).map((time, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                            <Clock className="w-4 h-4 text-violet-400" />
                            {time}
                        </div>
                    ))}
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                        <span className="w-4 h-4 rounded-full bg-amber-200 block" />
                        12:30 - 01:30 (Recess)
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Subjects & Difficulty</h3>
                        <p className="text-gray-400 text-sm">Managed via seed script.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subjects.map(s => (
                        <div key={s.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="font-bold text-gray-800">{s.name}</div>
                            <div className="text-xs text-gray-400 mb-2">{s.code}</div>
                            <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${s.difficulty === 3 ? 'bg-rose-100 text-rose-600' :
                                s.difficulty === 2 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                {s.difficulty === 3 ? 'Hard' : s.difficulty === 2 ? 'Medium' : 'Easy'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AllocationTab = () => {
    const [allocations, setAllocations] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [section, setSection] = useState("A");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [facultyList, setFacultyList] = useState([]);

    useEffect(() => {
        fetchAllocations();
        fetch('http://127.0.0.1:8001/subjects').then(r => r.json()).then(setSubjects);

        // Fetch Faculty to populate dropdown
        fetch('http://127.0.0.1:8001/users').then(r => r.json()).then(data => {
            const faculty = data.filter(u => u.role === 'faculty');
            setFacultyList(faculty);
        });
    }, []);

    const fetchAllocations = () => {
        fetch('http://127.0.0.1:8001/allocations').then(r => r.json()).then(setAllocations);
    };

    const handleAllocate = async () => {
        if (!selectedSubject || !section || !facultyId) return;

        await fetch('http://127.0.0.1:8001/allocations', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject_id: parseInt(selectedSubject),
                teacher_id: parseInt(facultyId),
                section_id: section
            })
        });
        fetchAllocations();
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Course Allocation</h3>

                {/* Minimal Form */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section</label>
                        <select
                            value={section}
                            onChange={e => setSection(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            <option value="">Select Subject...</option>
                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teacher</label>
                        <select
                            value={facultyId}
                            onChange={e => setFacultyId(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                            <option value="">Select Faculty...</option>
                            {facultyList.map(f => (
                                <option key={f.id} value={f.id}>{f.full_name} ({f.id})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAllocate}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Allocate
                    </button>
                </div>
            </div>

            <div className="p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-500 border-b border-gray-100">
                        <tr>
                            <th className="p-6 font-medium">Section</th>
                            <th className="p-6 font-medium">Subject ID</th>
                            <th className="p-6 font-medium">Faculty ID</th>
                            <th className="p-6 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {allocations.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-6 font-bold text-gray-800">{a.section_id}</td>
                                <td className="p-6">{a.subject_id}</td>
                                <td className="p-6 text-gray-600">{a.teacher_id}</td>
                                <td className="p-6">
                                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allocations.length === 0 && (
                    <div className="p-10 text-center text-gray-400 italic">No allocations yet.</div>
                )}
            </div>
        </div>
    );
};

const GenerateTab = () => {
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [previewSchedule, setPreviewSchedule] = useState([]);
    const [viewSection, setViewSection] = useState("K");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // Hardcoded for display alignment to match seed, or could fetch from API
    // Note: API returns start_time. We can map.
    const timeSlots = [
        "09:30 - 10:30", "10:30 - 11:30", "11:30 - 12:30",
        "LUNCH",
        "01:30 - 02:30", "02:30 - 03:30", "03:30 - 04:30", "04:30 - 05:30"
    ];

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8001/generate-timetable', { method: 'POST' });
            if (res.ok) {
                setGenerated(true);
                fetchDraftSchedule();
            }
        } catch (e) {
            alert("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchDraftSchedule = async () => {
        const res = await fetch(`http://127.0.0.1:8001/schedule?published_only=false&section=${viewSection}`);
        if (res.ok) {
            setPreviewSchedule(await res.json());
        }
    };

    useEffect(() => {
        if (generated) fetchDraftSchedule();
    }, [viewSection]);

    const handlePublish = async () => {
        setPublishing(true);
        try {
            await fetch('http://127.0.0.1:8001/publish-timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            alert("Timetable Published Successfully!");
        } catch (e) {
            alert("Publish failed");
        } finally {
            setPublishing(false);
        }
    };

    const getCellContent = (day, timeSlot) => {
        if (timeSlot === "LUNCH") return <div className="h-full flex items-center justify-center font-bold text-gray-400 tracking-widest text-xs rotate-0 md:-rotate-90">LUNCH</div>;

        const start = timeSlot.split(" - ")[0];
        const cls = previewSchedule.find(s => s.day_of_week === day && s.start_time === start);

        if (!cls) return <div className="h-full bg-gray-50/50"></div>;

        // Color coding based on 'difficulty' or subject name could be added here
        return (
            <div className="p-2 h-full flex flex-col justify-center bg-violet-50 border border-violet-100/50 rounded-lg text-xs hover:scale-105 transition-transform cursor-default">
                <div className="font-bold text-violet-900 leading-tight mb-1 line-clamp-2">{cls.course_name}</div>
                <div className="text-violet-500 font-mono text-[10px]">{cls.room}</div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl shadow-violet-200 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">AI Timetable Generator</h2>
                    <p className="text-violet-100 max-w-lg text-lg opacity-90">
                        Generate optimal schedules for Section K and others. Includes Saturday classes and Lunch breaks.
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-white text-violet-700 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-700" />
                    ) : (
                        <Play className="w-5 h-5 fill-current" />
                    )}
                    {loading ? 'Generating...' : 'Generate Schedule'}
                </button>
            </div>

            {/* Grid View */}
            <AnimatePresence>
                {generated && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6 px-2">
                            <div className="flex items-center gap-4">
                                <h3 className="text-xl font-bold text-gray-800">Draft Preview</h3>
                                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-md">
                                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].map(sec => (
                                        <button
                                            key={sec}
                                            onClick={() => setViewSection(sec)}
                                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all whitespace-nowrap ${viewSection === sec ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                                        >
                                            Sec {sec}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handlePublish} disabled={publishing} className="bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-100">
                                <CheckCircle className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Approve'}
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-3 bg-gray-900 text-white first:rounded-tl-xl text-sm font-medium w-24">Day / Time</th>
                                        {timeSlots.map((ts, i) => (
                                            <th key={i} className={`p-3 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border-b border-gray-200 ${i === timeSlots.length - 1 ? 'rounded-tr-xl' : ''}`}>
                                                {ts}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {days.map(day => (
                                        <tr key={day} className="group">
                                            <td className="p-3 bg-gray-50 font-bold text-gray-700 text-left border-r border-gray-100 text-sm">{day}</td>
                                            {timeSlots.map((ts, i) => (
                                                <td key={i} className="p-1 h-32 w-32 border-b border-r border-gray-100 relative group-hover:bg-gray-50/20 transition-colors">
                                                    {getCellContent(day, ts)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const AdminTimetable = () => {
    const [activeTab, setActiveTab] = useState('generate');

    const tabs = [
        { id: 'setup', label: 'Setup Data', icon: LayoutGrid },
        { id: 'allocation', label: 'Course Allocation', icon: List },
        { id: 'generate', label: 'Generate & Publish', icon: Calendar },
    ];

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable Management</h1>
                <p className="text-gray-500">Configure resources, manage allocations, and publish AI-optimized schedules.</p>
            </header>

            {/* Stepper / Tabs */}
            <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-200 inline-flex shadow-sm">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'setup' && <SetupTab />}
                        {activeTab === 'allocation' && <AllocationTab />}
                        {activeTab === 'generate' && <GenerateTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminTimetable;
