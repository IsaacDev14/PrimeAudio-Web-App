import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
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
    ChevronRight,
    Search,
    ShoppingCart
} from 'lucide-react';

const CustomerLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.slice(0, 5)); // Last 5 notifications
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

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

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Topbar */}
            <header className="hidden lg:flex fixed top-0 right-0 left-72 h-16 bg-white border-b border-gray-200 z-30 items-center justify-between px-6">
                {/* Search */}
                <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-gray-300 focus:ring-0 transition-colors"
                    />
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {/* Cart Link */}
                    <Link
                        to="/cart"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                    >
                        <ShoppingCart className="w-5 h-5 text-gray-600" />
                    </Link>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                        >
                            <Bell className="w-5 h-5 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        <Link
                                            to="/dashboard/notifications"
                                            className="text-xs text-blue-600 hover:underline"
                                            onClick={() => setShowNotifications(false)}
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-gray-500 text-sm">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                                                >
                                                    <p className="text-sm text-gray-900 font-medium">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(notif.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500">Customer</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>
            </header>

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
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 relative"
                    >
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </button>
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
                transform transition-transform duration-300 flex flex-col
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
                <nav className="p-4 flex-1 overflow-y-auto">
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
            <main className="lg:ml-72 lg:pt-16 min-h-screen">
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CustomerLayout;
