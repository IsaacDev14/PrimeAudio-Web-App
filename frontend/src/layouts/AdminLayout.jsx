import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { Search, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
    const { user, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Redirect if not logged in or not admin
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white sticky top-0 z-10 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">Prime Audio Admin</h2>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-10 w-64 rounded-lg bg-gray-50 border border-gray-200 pl-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all"
                            />
                        </div>
                        <button className="h-10 w-10 rounded-lg hover:bg-gray-100 flex items-center justify-center relative text-gray-500 hover:text-gray-700 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
