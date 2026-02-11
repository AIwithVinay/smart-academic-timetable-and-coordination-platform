import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Image as ImageIcon, User } from 'lucide-react';

const TeacherMessages = () => {
    const [section, setSection] = useState('H'); // Default section
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [image, setImage] = useState(null);
    const messagesEndRef = useRef(null);

    // Mock Teacher ID
    const userId = 1;

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Polling every 3s
        return () => clearInterval(interval);
    }, [section]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8001/messages/${section}?user_id=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !image) return;

        let imageUrl = null;

        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            try {
                const uploadRes = await fetch('http://127.0.0.1:8001/upload', {
                    method: 'POST',
                    body: formData
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    imageUrl = data.url;
                }
            } catch (error) {
                console.error("Upload failed", error);
                return;
            }
        }

        const payload = {
            section: section,
            sender_id: userId,
            content: newMessage,
            image_url: imageUrl,
            timestamp: new Date().toISOString(),
            is_anonymous: false // Teachers are never anonymous
        };

        try {
            await fetch('http://127.0.0.1:8001/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            setNewMessage('');
            setImage(null);
            fetchMessages();
        } catch (error) {
            console.error("Send failed", error);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-violet-600" /> Section Chat
                    </h1>
                    <p className="text-gray-500">Communicate with students instantly.</p>
                </div>
                <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg outline-none focus:border-violet-500 text-lg font-bold"
                >
                    {['A', 'B', 'C', 'D', 'E', 'H'].map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
            </header>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl p-4 ${msg.is_me ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'}`}>
                                    {!msg.is_me && (
                                        <p className={`text-xs font-bold mb-1 ${msg.role === 'teacher' ? 'text-violet-600' : 'text-orange-500'}`}>
                                            {msg.sender_name}
                                        </p>
                                    )}
                                    {msg.image_url && (
                                        <img src={msg.image_url} alt="Attachment" className="rounded-lg mb-2 max-h-60 object-cover" />
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] mt-2 text-right ${msg.is_me ? 'text-white/70' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-4 items-end">
                    <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 flex items-center px-4 py-2">
                        <input
                            type="text"
                            className="bg-transparent flex-1 outline-none text-gray-700 placeholder-gray-400"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <label className="cursor-pointer text-gray-400 hover:text-violet-600 transition-colors p-2">
                            <ImageIcon className="w-5 h-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !image}
                        className="p-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
                {image && (
                    <div className="px-4 pb-2 text-xs text-gray-500 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" /> Image selected: {image.name}
                        <button type="button" onClick={() => setImage(null)} className="text-red-500 hover:underline">Remove</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherMessages;
