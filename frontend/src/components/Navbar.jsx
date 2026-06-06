import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Sun, Moon, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cart } = useCart();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const { user } = useAuth();

    const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

    const navLinks = [
        { name: "Shop", path: "/shop" },
        { name: "Our Work", path: "/showcase" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Track Order", path: "/track-order" },
    ];

    const isActive = (path) => {
        if (path === "/shop") {
            return location.pathname === "/shop" || location.pathname.startsWith("/shop/");
        }
        return location.pathname === path;
    };

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const loadNotificationList = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/notifications/?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notification list:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleNotificationClick = () => {
        if (!showNotifications) {
            loadNotificationList();
        }
        setShowNotifications(!showNotifications);
    };

    const iconButtonClass =
        "p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors";

    return (
        <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 fixed top-0 left-0 w-full z-[100] shadow-sm">
            <div className="container mx-auto px-4 lg:px-6">
                <div className="flex items-center gap-4 lg:gap-6 h-16 lg:h-[4.5rem]">
                    {/* Logo */}
                    <Link to="/shop" className="shrink-0 flex items-center">
                        <img
                            src="/logo.png"
                            alt="Prime Audio Solutions"
                            className="h-10 sm:h-11 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop navigation */}
                    <div className="hidden lg:flex items-center gap-0.5 shrink-0">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                                    isActive(link.path)
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="hidden md:flex flex-1 min-w-0 max-w-md lg:max-w-sm xl:max-w-md ml-auto lg:ml-0">
                        <SearchAutocomplete className="w-full" compact />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 shrink-0 ml-auto md:ml-0">
                        {user && (
                            <div className="relative">
                                <button
                                    onClick={handleNotificationClick}
                                    className={`${iconButtonClass} relative`}
                                    aria-label="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                        <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-semibold text-slate-900">Notifications</h3>
                                            <Link to="/profile?tab=notifications" className="text-xs text-blue-600 hover:underline">
                                                View All
                                            </Link>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                                                            !notif.is_read ? 'bg-blue-50/50' : ''
                                                        }`}
                                                    >
                                                        <p className="text-sm font-medium text-slate-800">{notif.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                            {new Date(notif.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-slate-500 text-sm">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={toggleTheme}
                            className={iconButtonClass}
                            aria-label="Toggle dark mode"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>

                        <Link
                            to="/cart"
                            id="cart-icon"
                            className={`${iconButtonClass} relative group`}
                        >
                            <ShoppingCart className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] min-w-[1.125rem] h-[1.125rem] px-1 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <Link
                                to="/profile"
                                className="hidden lg:flex items-center ml-1 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                                </div>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden lg:flex items-center gap-1.5 ml-2 px-4 py-2 rounded-full text-sm font-semibold bg-prime-red text-white hover:bg-red-600 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Login
                            </Link>
                        )}

                        <button
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-slate-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-slate-700" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        <SearchAutocomplete className="w-full md:hidden" compact />

                        <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-center sm:text-left ${
                                        isActive(link.path)
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {user ? (
                            <Link
                                to="/profile"
                                className="flex items-center justify-center gap-2 bg-slate-100 text-slate-900 px-4 py-3 rounded-xl font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                My Account
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-2 bg-prime-red text-white px-4 py-3 rounded-xl font-semibold"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
