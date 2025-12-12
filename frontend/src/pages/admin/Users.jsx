import { useState } from "react";
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle, Clock, UserPlus } from "lucide-react";
import { Button } from "../../components/ui/button";

const AdminUsers = () => {
    const [users] = useState([
        { id: 1, name: "admin", email: "admin@primeaudio.co.ke", role: "Admin", status: "Active", lastActive: "Now" },
        { id: 2, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active", lastActive: "2 hours ago" },
        { id: 3, name: "Jane Smith", email: "jane@example.com", role: "Customer", status: "Inactive", lastActive: "2 days ago" },
    ]);

    const getStatusColor = (status) => {
        if (status === "Active") return "bg-green-100 text-green-700 border-green-200";
        return "bg-gray-100 text-gray-600 border-gray-200";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage system users and their roles.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search users..."
                            className="h-10 w-full rounded-lg bg-gray-50 border border-gray-200 pl-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                        />
                    </div>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            {user.role === "Admin" ? <ShieldAlert className="h-4 w-4 text-blue-600" /> : <Shield className="h-4 w-4 text-gray-400" />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {user.lastActive}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
