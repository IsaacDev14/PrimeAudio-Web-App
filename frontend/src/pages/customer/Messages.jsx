import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';
import {
    MessageSquare,
    Send,
    Plus,
    User,
    Clock,
    CheckCircle,
    Users,
    Headphones,
    ArrowLeft,
    X
} from 'lucide-react';

const CustomerMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showNewDialog, setShowNewDialog] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchAdmins();
        // Poll for new messages every 3 seconds for real-time feel
        pollIntervalRef.current = setInterval(() => {
            fetchConversations();
            if (selectedConversation) {
                fetchMessages(selectedConversation.id);
            }
        }, 3000);
        return () => clearInterval(pollIntervalRef.current);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            // On mobile, show chat view when conversation selected
            setShowMobileChat(true);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdmins = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/auth/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAdmins(data);
            }
        } catch (error) {
            console.error('Error fetching admins:', error);
        }
    };

    const fetchMessages = async (conversationId) => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/messages/conversations/${conversationId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const token = localStorage.getItem('token');
        setIsSending(true);

        try {
            const res = await fetch(`${API_URL}/messages/conversations/${selectedConversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedConversation.id);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleNewConversation = async (admin) => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: `Chat with ${admin.full_name || 'Support'}`,
                    admin_id: admin.id
                })
            });

            if (res.ok) {
                const data = await res.json();
                setShowNewDialog(false);
                fetchConversations();
                setSelectedConversation(data);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleBackToList = () => {
        setShowMobileChat(false);
        setSelectedConversation(null);
    };

    return (
        <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-500 text-sm mt-1 hidden sm:block">Chat with our support team</p>
                </div>
                <button
                    onClick={() => setShowNewDialog(true)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">New Message</span>
                </button>
            </div>

            <div className="flex-1 flex bg-white rounded-xl border border-gray-200 overflow-hidden relative">
                {/* Conversations Sidebar */}
                <div className={`
                    ${showMobileChat ? 'hidden md:flex' : 'flex'}
                    w-full md:w-80 border-r border-gray-200 flex-col
                `}>
                    {/* Support Staff Section */}
                    <div className="p-3 md:p-4 border-b border-gray-200 bg-blue-50">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                            <Headphones className="w-4 h-4 text-blue-600" />
                            <h2 className="font-semibold text-gray-900 text-sm">Support Staff</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {admins.slice(0, 4).map((admin) => (
                                <div key={admin.id} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-200">
                                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-700 truncate max-w-[80px]">{admin.full_name}</span>
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                </div>
                            ))}
                            {admins.length === 0 && (
                                <span className="text-xs text-gray-500">Loading staff...</span>
                            )}
                        </div>
                    </div>

                    <div className="p-3 md:p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 text-sm">Conversations</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-6 md:p-8 text-center">
                                <MessageSquare className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm">No conversations yet</p>
                                <button
                                    onClick={() => setShowNewDialog(true)}
                                    className="text-blue-600 text-sm hover:underline mt-2"
                                >
                                    Start a new conversation
                                </button>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-3 md:p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 truncate text-sm">
                                            {conv.subject}
                                        </span>
                                        {conv.unread_count > 0 && (
                                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 truncate mt-1">
                                        {conv.last_message || 'No messages yet'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                        <span className={`px-1.5 py-0.5 rounded ${conv.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {conv.status}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className={`
                    ${showMobileChat ? 'flex' : 'hidden md:flex'}
                    flex-1 flex-col absolute md:relative inset-0 md:inset-auto bg-white
                `}>
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                                <button
                                    onClick={handleBackToList}
                                    className="md:hidden p-1 hover:bg-gray-200 rounded-lg"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{selectedConversation.subject}</h3>
                                    <p className="text-xs md:text-sm text-gray-500">
                                        Support team will respond shortly
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_is_admin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.sender_is_admin
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'bg-blue-600 text-white'
                                            } rounded-2xl px-3 md:px-4 py-2 md:py-3`}>
                                            {msg.sender_is_admin && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <User className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {msg.sender_name}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.sender_is_admin ? 'text-gray-400' : 'text-blue-200'
                                                }`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200">
                                <div className="flex gap-2 md:gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        disabled={isSending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSending || !newMessage.trim()}
                                        className="px-3 md:px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-4">
                                <MessageSquare className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-sm md:text-base">Select a conversation or start a new one</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Conversation Dialog */}
            <AnimatePresence>
                {showNewDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowNewDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Dialog Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">New Conversation</h3>
                                <button
                                    onClick={() => setShowNewDialog(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-4">
                                <p className="text-sm text-gray-500 mb-4">
                                    Tap a support agent to start chatting
                                </p>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {admins.map((admin) => (
                                        <button
                                            key={admin.id}
                                            onClick={() => handleNewConversation(admin)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <User className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-medium text-gray-900">
                                                    {admin.full_name || 'Support Agent'}
                                                </p>
                                                <p className="text-xs text-gray-500">{admin.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                                                <span className="text-xs text-green-600">Online</span>
                                            </div>
                                        </button>
                                    ))}
                                    {admins.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                            Loading support staff...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerMessages;
