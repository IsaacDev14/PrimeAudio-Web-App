import { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { Search, Bell, Menu, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";

const AdminLayout = () => {
    const { user, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login?redirect=/admin" replace />;
    }

    if (!user.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-14 md:h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white sticky top-0 z-10 shadow-sm gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    >
                        <Menu size={22} />
                    </button>

                    <h2 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                        Prime Audio Admin
                    </h2>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search - Hidden on very small screens */}
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-9 md:h-10 w-40 md:w-64 rounded-lg bg-gray-50 border border-gray-200 pl-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all"
                            />
                        </div>
                        <button className="h-9 w-9 md:h-10 md:w-10 rounded-lg hover:bg-gray-100 flex items-center justify-center relative text-gray-500 hover:text-gray-700 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 md:top-2 right-1.5 md:right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </button>

                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 md:h-11 md:w-11 rounded-full ring-2 ring-white shadow-md hover:ring-blue-100 transition-all">
                                    <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.full_name || 'Admin User'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/admin/settings" className="cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="text-red-600 focus:text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
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
                        <AlertDialogAction onClick={logout} className="bg-red-600 hover:bg-red-700">
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminLayout;
