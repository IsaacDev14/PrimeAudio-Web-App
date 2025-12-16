import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../config/api';
import {
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle,
    X,
    Search,
    RefreshCw,
    Users,
    Plus,
    ArrowLeft
} from 'lucide-react';

const AdminMessages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchCustomers();
        // Poll for new messages every 5 seconds for real-time feel
        pollIntervalRef.current = setInterval(() => {
            fetchConversations();
            if (selectedConversation) {
                fetchMessages(selectedConversation.id);
            }
        }, 5000);
        return () => clearInterval(pollIntervalRef.current);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
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

    const fetchCustomers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/auth/users?role=customer`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
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
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleCloseConversation = async (conversationId) => {
        const token = localStorage.getItem('token');

        try {
            await fetch(`${API_URL}/messages/conversations/${conversationId}/close`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchConversations();
        } catch (error) {
            console.error('Error closing conversation:', error);
        }
    };

    const handleStartConversation = async (customer) => {
        const token = localStorage.getItem('token');

        // Check if conversation already exists with this customer
        const existingConv = conversations.find(c =>
            c.customer_id === customer.id || c.customer_email === customer.email
        );

        if (existingConv) {
            setSelectedConversation(existingConv);
            setShowUserList(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/messages/conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: `Chat with ${customer.full_name || customer.email}`,
                    customer_id: customer.id
                })
            });

            if (res.ok) {
                const data = await res.json();
                setShowUserList(false);
                fetchConversations();
                setSelectedConversation(data);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCustomers = customers.filter(customer =>
        customer.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    const openConversations = filteredConversations.filter(c => c.status === 'open');
    const closedConversations = filteredConversations.filter(c => c.status === 'closed');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Customer Messages</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {openConversations.length} open conversation{openConversations.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowUserList(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Chat</span>
                    </button>
                    <button
                        onClick={fetchConversations}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
                {/* Conversations Sidebar */}
                <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400">
                                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                Loading...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm">No conversations</p>
                                <button
                                    onClick={() => setShowUserList(true)}
                                    className="text-blue-600 text-sm hover:underline mt-2"
                                >
                                    Start a new chat
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Open Conversations */}
                                {openConversations.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Open ({openConversations.length})
                                        </div>
                                        {openConversations.map((conv) => (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-900 truncate text-sm">
                                                        {conv.customer_name || conv.customer_email}
                                                    </span>
                                                    {conv.unread_count > 0 && (
                                                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{conv.subject}</p>
                                                <p className="text-xs text-gray-400 truncate mt-1">
                                                    {conv.last_message || 'No messages yet'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Closed Conversations */}
                                {closedConversations.length > 0 && (
                                    <div>
                                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Closed ({closedConversations.length})
                                        </div>
                                        {closedConversations.map((conv) => (
                                            <button
                                                key={conv.id}
                                                onClick={() => setSelectedConversation(conv)}
                                                className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors opacity-60 ${selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-700 truncate text-sm">
                                                        {conv.customer_name || conv.customer_email}
                                                    </span>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{conv.subject}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="hidden md:flex flex-1 flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{selectedConversation.customer_name || 'Customer'}</h3>
                                        <p className="text-xs text-gray-500">{selectedConversation.customer_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedConversation.status === 'open' && (
                                        <button
                                            onClick={() => handleCloseConversation(selectedConversation.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                                        <p>No messages yet. Start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_is_admin ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] ${msg.sender_is_admin
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-900 border border-gray-200'
                                                } rounded-2xl px-4 py-3 shadow-sm`}>
                                                {!msg.sender_is_admin && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-medium text-gray-500">
                                                            {msg.sender_name}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.sender_is_admin ? 'text-blue-200' : 'text-gray-400'
                                                    }`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            {selectedConversation.status === 'open' ? (
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isSending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSending || !newMessage.trim()}
                                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4 border-t border-gray-200 bg-gray-100 text-center text-gray-500">
                                    This conversation is closed
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 mb-4">Select a conversation to view messages</p>
                                <button
                                    onClick={() => setShowUserList(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Start New Chat
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* User List Modal */}
            <AnimatePresence>
                {showUserList && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowUserList(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Start New Chat</h3>
                                <button
                                    onClick={() => setShowUserList(false)}
                                    className="p-1 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* User List */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {filteredCustomers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No customers found
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredCustomers.map((customer) => {
                                            const hasConversation = conversations.some(c =>
                                                c.customer_id === customer.id || c.customer_email === customer.email
                                            );
                                            return (
                                                <button
                                                    key={customer.id}
                                                    onClick={() => handleStartConversation(customer)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-medium text-gray-900">
                                                            {customer.full_name || 'Customer'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{customer.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {hasConversation && (
                                                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                                Active
                                                            </span>
                                                        )}
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMessages;
