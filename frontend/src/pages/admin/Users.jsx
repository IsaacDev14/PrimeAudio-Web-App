import { useState } from "react";
import { Search, MoreVertical, Shield, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../components/ui/button";

const AdminUsers = () => {
    // Mock Data based on screenshot
    const [users] = useState([
        { id: 1, name: "admin", email: "admin@primeaudio.co.ke", role: "Admin", status: "Active", lastActive: "Now" },
        { id: 2, name: "John Doe", email: "john@example.com", role: "Customer", status: "Active", lastActive: "2 hours ago" },
        { id: 3, name: "Jane Smith", email: "jane@example.com", role: "Customer", status: "Inactive", lastActive: "2 days ago" },
    ]);

    const getStatusColor = (status) => {
        if (status === "Active") return "bg-green-500/20 text-green-400 border-green-500/30";
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage system users and their roles.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add User
                </Button>
            </div>

            {/* Content Card */}
            <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            placeholder="Search users..."
                            className="h-10 w-full rounded-lg bg-slate-900 border-slate-700 pl-10 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                        />
                    </div>
                    <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                        Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-[#0f172a] text-slate-200 uppercase tracking-wider font-semibold text-xs border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Active</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            {user.role === "Admin" ? <ShieldAlert className="h-4 w-4 text-blue-400" /> : <Shield className="h-4 w-4 text-slate-500" />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {user.lastActive}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors">
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
