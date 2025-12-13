import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Sun, Moon, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import SearchAutocomplete from './SearchAutocomplete';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { cart } = useCart();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();

    const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Track Order", path: "/track-order" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-gray-100 fixed top-0 left-0 w-full z-[100]">
            <div className="container mx-auto px-2">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Prime Audio" className="h-10 w-auto object-contain" />
                        <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
                            Prime<span className="text-blue-600">Audio</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive(link.path)
                                    ? "bg-slate-100 text-blue-600"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar - Desktop with Autocomplete */}
                    <div className="hidden lg:flex flex-1 max-w-sm mx-8">
                        <SearchAutocomplete className="w-full" />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </button>

                        {/* Cart */}
                        <Link to="/cart" id="cart-icon" className="relative p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors group">
                            <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors" />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                                    {cartItemsCount}
                                </span>
                            )}
                        </Link>

                        {/* Login - More balanced, less aggressive */}
                        <Link
                            to="/login"
                            className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all bg-prime-red text-white hover:bg-red-600 shadow-sm hover:shadow active:scale-95"
                        >
                            <User className="w-4 h-4" />
                            <span>Login</span>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                className="mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

