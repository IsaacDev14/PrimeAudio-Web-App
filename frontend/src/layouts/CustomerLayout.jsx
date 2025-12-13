import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Heart,
    MapPin,
    User,
    LogOut,
    Bell,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

const CustomerLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/dashboard/orders', icon: ShoppingBag, label: 'My Orders' },
        { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
        { to: '/dashboard/wishlist', icon: Heart, label: 'Wishlist' },
        { to: '/dashboard/addresses', icon: MapPin, label: 'Addresses' },
        { to: '/dashboard/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="flex items-center justify-between px-4 h-16">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Prime Audio" className="h-8 w-auto" />
                        <span className="font-bold text-gray-900">Prime Audio</span>
                    </Link>
                    <Link to="/dashboard/notifications" className="p-2 relative">
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50
                transform transition-transform duration-300
                lg:translate-x-0 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="Prime Audio" className="h-10 w-auto" />
                            <span className="font-bold text-gray-900 text-lg">Prime Audio</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                                {user?.full_name || 'User'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 flex-1">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.exact}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200">
                    <Link
                        to="/shop"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3"
                    >
                        Continue Shopping
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 min-h-screen">
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
