import { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-dark-surface/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="Prime Audio Solutions" className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-gray-300 hover:text-prime-blue transition-colors font-medium">Home</Link>
                        <Link to="/shop" className="text-gray-300 hover:text-prime-blue transition-colors font-medium">Shop</Link>
                        <Link to="/services" className="text-gray-300 hover:text-prime-blue transition-colors font-medium">Services</Link>
                        <Link to="/track-order" className="text-gray-300 hover:text-prime-blue transition-colors font-medium">Track Order</Link>
                        <Link to="/contact" className="text-gray-300 hover:text-prime-blue transition-colors font-medium">Contact</Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="text-gray-300 hover:text-prime-red transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <Link to="/cart" className="relative text-gray-300 hover:text-prime-blue transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="absolute -top-2 -right-2 bg-prime-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">0</span>
                        </Link>
                        <Link to="/login" className="bg-prime-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all">
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                        <Link to="/" className="block text-gray-300 hover:text-prime-blue font-medium">Home</Link>
                        <Link to="/shop" className="block text-gray-300 hover:text-prime-blue font-medium">Shop</Link>
                        <Link to="/services" className="block text-gray-300 hover:text-prime-blue font-medium">Services</Link>
                        <Link to="/track-order" className="block text-gray-300 hover:text-prime-blue font-medium">Track Order</Link>
                        <Link to="/contact" className="block text-gray-300 hover:text-prime-blue font-medium">Contact</Link>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                            <Link to="/login" className="flex-1 bg-prime-blue text-center py-2 rounded-lg text-white font-medium">Login</Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
