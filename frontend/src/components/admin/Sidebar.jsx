import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Settings, FileText, Image, TicketCheck, Package, LogOut, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Package, label: "Products", path: "/admin/products" },
        { icon: TicketCheck, label: "Orders", path: "/admin/orders" },
        { icon: FileText, label: "Content", path: "/admin/content" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: Image, label: "Media", path: "/admin/media" },
        { icon: MessageSquare, label: "AI Tools", path: "/admin/ai-tools" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
    ];

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
    };

    return (
        <>
            <div className="h-screen w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col sticky top-0">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <Link to="/" className="text-xl font-bold flex items-center gap-2">
                        <span className="text-white">Prime Audio</span>
                        <span className="text-blue-500">Admin</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                        : "hover:bg-slate-800 hover:text-white text-slate-400"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-800 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.full_name || 'Admin'}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {user?.email || 'admin@primeaudio.co.ke'}
                            </p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to logout? You will need to sign in again to access the admin area.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default Sidebar;
