import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle,
    X,
    Search,
    RefreshCw,
    Users
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
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchCustomers();
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
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
            const res = await fetch('http://localhost:8000/messages/conversations', {
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
            const res = await fetch('http://localhost:8000/auth/users?role=customer', {
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
            const res = await fetch(`http://localhost:8000/messages/conversations/${conversationId}/messages`, {
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
            const res = await fetch(`http://localhost:8000/messages/conversations/${selectedConversation.id}/messages`, {
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
            await fetch(`http://localhost:8000/messages/conversations/${conversationId}/close`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchConversations();
        } catch (error) {
            console.error('Error closing conversation:', error);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openConversations = filteredConversations.filter(c => c.status === 'open');
    const closedConversations = filteredConversations.filter(c => c.status === 'closed');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Messages</h1>
                    <p className="text-gray-500 mt-1">
                        {openConversations.length} open conversation{openConversations.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={fetchConversations}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
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

                    {/* Registered Customers Section */}
                    <div className="p-3 border-b border-gray-200 bg-green-50">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-gray-900 text-sm">Registered Customers ({customers.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                            {customers.map((customer) => (
                                <div key={customer.id} className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-200 text-xs">
                                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                                        <User className="w-2 h-2 text-white" />
                                    </div>
                                    <span className="text-gray-700 truncate max-w-[100px]">{customer.full_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400">Loading...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm">No conversations</p>
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
                                                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
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
                                                <p className="text-sm text-gray-600 truncate">{conv.subject}</p>
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
                                                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors opacity-60 ${selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium text-gray-700 truncate text-sm">
                                                        {conv.customer_name || conv.customer_email}
                                                    </span>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                                <p className="text-sm text-gray-500 truncate">{conv.subject}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedConversation.subject}</h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedConversation.customer_name} ({selectedConversation.customer_email})
                                    </p>
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
                                        <p>No messages yet</p>
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
                                                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <User className="w-3 h-3 text-gray-600" />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-500">
                                                            {msg.sender_name}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <p className={`text-xs mt-1 flex items-center gap-1 ${msg.sender_is_admin ? 'text-blue-200' : 'text-gray-400'
                                                    }`}>
                                                    <Clock className="w-3 h-3" />
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
                                <p className="text-gray-500">Select a conversation to view messages</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
