import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { Search, Bell } from "lucide-react";

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a] sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-white">Quantum Admin</h2>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-10 w-64 rounded-full bg-slate-800 border-none pl-10 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500"
                            />
                        </div>
                        <button className="h-10 w-10 rounded-full hover:bg-slate-800 flex items-center justify-center relative text-slate-400 hover:text-white transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-[#0f172a]"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
