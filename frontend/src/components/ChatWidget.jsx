import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, RotateCcw, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '../config/api';

const initialMessage = { id: 1, text: "Hello! I'm your Prime Audio assistant. How can I help you find the perfect instrument today?", sender: 'ai' };

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([initialMessage]);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const resetChat = () => {
        setMessages([initialMessage]);
        setShowConfirm(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Helper function to send a message (used by both input and suggested questions)
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Send to backend
        try {
            const response = await fetch(`${API_URL}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            setIsTyping(false);

            if (response.ok) {
                const aiMsg = {
                    id: Date.now() + 1,
                    text: data.response,
                    sender: 'ai'
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error(data.detail || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            const errorMsg = {
                id: Date.now() + 1,
                text: "I'm having trouble connecting. Please try again.",
                sender: 'ai'
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    const handleSend = () => {
        sendMessage(inputText);
        setInputText("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl flex items-center gap-2">
                                        <span className="animate-wave inline-block origin-bottom-right text-2xl">👋</span>
                                        Hi there!
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setShowConfirm(true)}
                                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                                            aria-label="Clear chat"
                                            title="Clear conversation"
                                        >
                                            <RotateCcw size={16} className="text-white/80" />
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                                            aria-label="Close chat"
                                        >
                                            <X size={20} className="text-white/90" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-blue-50 text-sm font-medium opacity-90">
                                    How can we help you today?
                                </p>
                            </div>

                            {/* Confirmation Modal */}
                            <AnimatePresence>
                                {showConfirm && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 rounded-2xl"
                                    >
                                        <div className="bg-white p-4 rounded-xl shadow-lg text-center max-w-[250px]">
                                            <p className="text-gray-800 font-medium mb-3 text-sm">Clear this conversation?</p>
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => setShowConfirm(false)}
                                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={resetChat}
                                                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 1 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {[
                                        { text: "About Us", emoji: "🎵", color: "bg-blue-50 border-blue-200 hover:bg-blue-100" },
                                        { text: "Our Products", emoji: "🎸", color: "bg-green-50 border-green-200 hover:bg-green-100" },
                                        { text: "Track Order", emoji: "📦", color: "bg-orange-50 border-orange-200 hover:bg-orange-100" },
                                        { text: "Warranty Info", emoji: "🛡️", color: "bg-purple-50 border-purple-200 hover:bg-purple-100" }
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(item.text)}
                                            className={`p-3 border rounded-xl text-sm text-gray-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2 ${item.color}`}
                                        >
                                            <span className="text-lg">{item.emoji}</span>
                                            <span className="font-medium">{item.text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === 'user'
                                        ? 'bg-prime-blue text-white rounded-br-sm'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                                        }`}>
                                        {msg.sender === 'ai' ? (
                                            <div className="prose prose-sm prose-gray max-w-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>p]:mb-2 [&>p:last-child]:mb-0">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 shadow-sm">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-prime-blue focus:ring-1 focus:ring-prime-blue/20 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputText.trim()}
                                    className="bg-prime-blue text-white p-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm active:scale-95 transform"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-prime-blue hover:bg-blue-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all z-[100] relative"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
