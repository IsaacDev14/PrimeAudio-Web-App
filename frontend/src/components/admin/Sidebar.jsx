import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, MessageSquare, Settings, FileText, Image, ShoppingBag, TicketCheck, Package } from "lucide-react";
import { cn } from "../../lib/utils";

const Sidebar = () => {
    const location = useLocation();

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

    return (
        <div className="h-screen w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col sticky top-0">
            <div className="p-6">
                <Link to="/" className="text-xl font-bold text-blue-500 flex items-center gap-2">
                    <span className="text-white">Prime Audio</span> Admin
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
                                    ? "bg-blue-600/10 text-blue-400 border-l-2 border-blue-500"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                        A
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Admin</p>
                        <p className="text-xs text-slate-500">admin@primeaudio.co.ke</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
