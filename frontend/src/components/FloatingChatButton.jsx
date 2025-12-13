import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const FloatingChatButton = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const quickActions = [
        { label: "Track my order", icon: "📦" },
        { label: "Return policy", icon: "↩️" },
        { label: "Product inquiry", icon: "🎧" },
        { label: "Talk to support", icon: "💬" }
    ];

    return (
        <>
            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Pulse Animation */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-40">
                    <span className="absolute inline-flex h-14 w-14 rounded-full bg-blue-400 opacity-75 animate-ping" />
                </div>
            )}

            {/* Chat Widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                            <h3 className="font-bold text-lg">👋 Hi there!</h3>
                            <p className="text-sm text-blue-100">How can we help you today?</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 space-y-2">
                            {quickActions.map((action, idx) => (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-left"
                                    onClick={() => {
                                        if (action.label === "Talk to support") {
                                            // Navigate to messages
                                        }
                                    }}
                                >
                                    <span className="text-xl">{action.icon}</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {action.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Message Input or Login Prompt */}
                        <div className="p-4 border-t dark:border-slate-700">
                            {user ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 border-0 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="block w-full py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Login to start a conversation →
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingChatButton;
