import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';

const StudentFees = () => {
    const [activeTab, setActiveTab] = useState('academic');
    const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
    const [eodDues, setEodDues] = useState({ dues: [], total_amount: 0 });
    const [loading, setLoading] = useState(true);
    const [addAmount, setAddAmount] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Wallet
            const walletRes = await fetch(`http://127.0.0.1:8001/wallet/${userId}`);
            if (walletRes.ok) setWallet(await walletRes.json());

            // Fetch EOD Dues
            const eodRes = await fetch(`http://127.0.0.1:8001/student/eod-dues/${userId}`);
            if (eodRes.ok) setEodDues(await eodRes.json());

        } catch (error) {
            console.error("Failed to fetch fees data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMoney = async () => {
        if (!addAmount || isNaN(addAmount) || parseFloat(addAmount) <= 0) return;
        try {
            const res = await fetch('http://127.0.0.1:8001/wallet/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: parseInt(userId), amount: parseFloat(addAmount) })
            });
            if (res.ok) {
                fetchData();
                setAddAmount('');
                alert("Money added!");
            }
        } catch (error) {
            console.error("Failed to add money", error);
        }
    };

    const handlePayEOD = async () => {
        try {
            const subjects = eodDues.dues.map(d => d.subject);
            const res = await fetch('http://127.0.0.1:8001/student/pay-eod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    amount: eodDues.total_amount,
                    subjects: subjects
                })
            });

            if (res.ok) {
                alert("Payment Successful!");
                fetchData();
            } else {
                const err = await res.json();
                alert(`Payment Failed: ${err.detail}`);
            }
        } catch (error) {
            console.error("Payment error", error);
        }
    };

    const mockFees = [
        { id: 1, title: 'Semester Tuition Fee', amount: 45000, status: 'Paid', due: '2023-08-15' },
        { id: 2, title: 'Library Fee', amount: 2000, status: 'Paid', due: '2023-08-15' },
        { id: 3, title: 'Exam Fee (Regular)', amount: 1500, status: 'Due', due: '2023-12-01' },
    ];

    if (loading) return <div className="p-8 text-center">Loading fees data...</div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Fees & Payments</h1>
                <p className="text-gray-500">Manage your tuition fees and wallet.</p>
            </header>

            {/* Wallet Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-violet-200 text-sm font-medium">Wallet Balance</p>
                            <h2 className="text-4xl font-bold mt-2">₹{wallet.balance.toFixed(2)}</h2>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-3">
                        <input
                            type="number"
                            placeholder="Amount"
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-violet-200 outline-none focus:bg-white/20 w-32"
                        />
                        <button
                            onClick={handleAddMoney}
                            className="flex items-center gap-2 bg-white text-violet-600 px-4 py-2 rounded-lg font-medium hover:bg-violet-50 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Money
                        </button>
                    </div>
                </div>

                {/* Status Card (Mock) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 font-medium uppercase text-sm mb-4">Payment Status</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-emerald-600 font-bold text-lg">
                            75%
                        </div>
                        <div>
                            <p className="text-gray-800 font-semibold">Fees Cleared</p>
                            <p className="text-sm text-gray-500">Next due date: Dec 1st</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('academic')}
                    className={`pb-3 font-medium transition-colors relative ${activeTab === 'academic' ? 'text-violet-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Academic Fees
                    {activeTab === 'academic' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('eod')}
                    className={`pb-3 font-medium transition-colors relative ${activeTab === 'eod' ? 'text-violet-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Exam On Demand / Remedial
                    {eodDues.total_amount > 0 && <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Dues</span>}
                    {activeTab === 'eod' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 font-medium transition-colors relative ${activeTab === 'history' ? 'text-violet-600' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    Transaction History
                    {activeTab === 'history' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600" />}
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
                {activeTab === 'academic' && (
                    <div className="space-y-4">
                        {mockFees.map(fee => (
                            <div key={fee.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100">
                                <div>
                                    <h4 className="font-semibold text-gray-800">{fee.title}</h4>
                                    <p className="text-sm text-gray-500">Due: {fee.due}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">₹{fee.amount}</p>
                                    <span className={`text-xs px-2 py-1 rounded-md ${fee.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {fee.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'eod' && (
                    <div className="space-y-6">
                        {eodDues.dues.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                                <p className="text-gray-500">You have no pending Exam on Demand dues! Great job.</p>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-red-800">Remedial Fees Due</h3>
                                        <p className="text-red-600 text-sm mt-1">
                                            You have failed in {eodDues.dues.length} subject(s). Please clear the dues to register for the re-exam.
                                        </p>

                                        <div className="mt-4 space-y-2">
                                            {eodDues.dues.map((due, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-red-700">
                                                    <span>{due.subject} (Marks: {due.marks})</span>
                                                    <span>₹{due.fee}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-red-200 pt-2 mt-2 flex justify-between font-bold text-red-900">
                                                <span>Total Payable</span>
                                                <span>₹{eodDues.total_amount}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePayEOD}
                                            className="mt-6 w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                        >
                                            Pay ₹{eodDues.total_amount} from Wallet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {wallet.transactions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No transactions found.</p>
                        ) : (
                            wallet.transactions.map(txn => (
                                <div key={txn.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {txn.type === 'CREDIT' ? <Plus className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{txn.description}</p>
                                            <p className="text-xs text-gray-500">{new Date(txn.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentFees;
