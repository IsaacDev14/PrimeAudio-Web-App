import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Settings, FileText, Image, TicketCheck, Package, LogOut, MessageSquare, ChevronRight, Gift, X, Sparkles, Activity } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Package, label: "Products", path: "/admin/products" },
        { icon: TicketCheck, label: "Orders", path: "/admin/orders" },
        { icon: Gift, label: "Offers", path: "/admin/offers" },
        { icon: FileText, label: "Content", path: "/admin/content" },
        { icon: Users, label: "Users", path: "/admin/users" },
        { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
        { icon: Image, label: "Media", path: "/admin/media" },
        { icon: Sparkles, label: "AI Tools", path: "/admin/ai-tools" },
        { icon: Activity, label: "Activity Log", path: "/admin/activity" },
        { icon: Settings, label: "Settings", path: "/admin/settings" },
    ];

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when navigating
        if (onClose) onClose();
    };

    const sidebarContent = (
        <div className="h-screen w-64 bg-white text-gray-700 border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 md:gap-3" onClick={handleNavClick}>
                    <img src="/logo.png" alt="Prime Audio" className="h-8 md:h-10 w-auto" />
                    <div>
                        <span className="text-base md:text-lg font-bold text-gray-900">Prime Audio</span>
                        <span className="ml-1 text-blue-600 font-semibold text-sm md:text-base">Admin</span>
                    </div>
                </Link>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 md:px-4 py-3 md:py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={cn(
                                "flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                                    : "hover:bg-gray-100 hover:text-gray-900 text-gray-600"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="h-4 w-4" />}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section Removed - Moved to AdminLayout Header */}

        </div>
    );

    return (
        <>
            {/* Desktop Sidebar - always visible */}
            <div className="hidden md:block sticky top-0 h-screen shadow-sm">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar - overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="md:hidden fixed inset-0 bg-black/50 z-40"
                        />
                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="md:hidden fixed left-0 top-0 z-50 h-full"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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
