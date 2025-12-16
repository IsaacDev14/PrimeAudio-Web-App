import { useState, useEffect } from "react";
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle, Clock, UserPlus, Users, User, Mail, MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // all, customers, admins

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/auth/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        if (status === "active") return "bg-green-100 text-green-700 border-green-200";
        return "bg-gray-100 text-gray-600 border-gray-200";
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "customers") return matchesSearch && !user.is_admin;
        if (activeTab === "admins") return matchesSearch && user.is_admin;
        return matchesSearch;
    });

    const customerCount = users.filter(u => !u.is_admin).length;
    const adminCount = users.filter(u => u.is_admin).length;

    const tabs = [
        { id: "all", label: "All Users", count: users.length },
        { id: "customers", label: "Customers", count: customerCount },
        { id: "admins", label: "Admins", count: adminCount },
    ];

    const handleMessageUser = (user) => {
        navigate('/admin/messages', { state: { selectedUser: user } });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage system users and their roles.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-200 text-gray-600'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 w-full rounded-lg bg-gray-50 border border-gray-200 pl-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${user.is_admin
                                                    ? 'bg-gradient-to-br from-purple-500 to-blue-600'
                                                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                    }`}>
                                                    {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.full_name || 'No Name'}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                {user.is_admin ? (
                                                    <ShieldAlert className="h-4 w-4 text-purple-600" />
                                                ) : (
                                                    <User className="h-4 w-4 text-blue-500" />
                                                )}
                                                <span className="capitalize">{user.is_admin ? 'Admin' : 'Customer'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium border capitalize ${getStatusColor(user.status || 'active')}`}>
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {user.created_at
                                                    ? new Date(user.created_at).toLocaleDateString()
                                                    : 'N/A'
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {!user.is_admin && (
                                                    <button
                                                        onClick={() => handleMessageUser(user)}
                                                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Message user"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer with count */}
                {!isLoading && filteredUsers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
