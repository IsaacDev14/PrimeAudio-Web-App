import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    Send,
    Plus,
    User,
    Clock,
    CheckCircle,
    Users,
    Headphones
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
    const [admins, setAdmins] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        fetchAdmins();
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
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:8000/messages/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
                if (data.length > 0 && !selectedConversation) {
                    setSelectedConversation(data[0]);
                }
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
            const res = await fetch('http://localhost:8000/auth/users', {
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
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleNewConversation = async () => {
        if (!newSubject.trim()) return;

        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:8000/messages/conversations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject: newSubject })
            });

            if (res.ok) {
                const data = await res.json();
                setShowNewDialog(false);
                setNewSubject('');
                fetchConversations();
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-500 mt-1">Chat with our support team</p>
                </div>
                <button
                    onClick={() => setShowNewDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Message
                </button>
            </div>

            <div className="flex-1 flex bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                    {/* Support Staff Section */}
                    <div className="p-4 border-b border-gray-200 bg-blue-50">
                        <div className="flex items-center gap-2 mb-3">
                            <Headphones className="w-4 h-4 text-blue-600" />
                            <h2 className="font-semibold text-gray-900 text-sm">Support Staff</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {admins.map((admin) => (
                                <div key={admin.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-700">{admin.full_name}</span>
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                </div>
                            ))}
                            {admins.length === 0 && (
                                <span className="text-xs text-gray-500">Loading staff...</span>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Conversations</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
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
                                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative z-10 ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 truncate">
                                            {conv.subject}
                                        </span>
                                        {conv.unread_count > 0 && (
                                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-1">
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
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-900">{selectedConversation.subject}</h3>
                                <p className="text-sm text-gray-500">
                                    Support team will respond shortly
                                </p>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender_is_admin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.sender_is_admin
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'bg-blue-600 text-white'
                                            } rounded-2xl px-4 py-3`}>
                                            {msg.sender_is_admin && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <User className="w-3 h-3 text-white" />
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
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
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
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Select a conversation or start a new one</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Conversation Dialog */}
            {showNewDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Conversation</h3>
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="What's your question about?"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setShowNewDialog(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNewConversation}
                                disabled={!newSubject.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Start Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerMessages;
