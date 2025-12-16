import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { API_URL } from '../config/api';

const SearchAutocomplete = ({ className = "" }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/products/?search=${encodeURIComponent(query)}&limit=6`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    window.location.href = `/shop/${results[selectedIndex].id}`;
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-all"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setIsOpen(false); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                {isLoading && (
                    <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 animate-spin" />
                )}
            </div>

            {/* Results Dropdown */}
            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border dark:border-slate-700 overflow-hidden z-50"
                    >
                        {results.map((product, index) => (
                            <Link
                                key={product.id}
                                to={`/shop/${product.id}`}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                    }`}
                            >
                                <img
                                    src={product.image_url || '/placeholder.jpg'}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-sm text-slate-500">{product.category}</p>
                                </div>
                                <span className="font-bold text-blue-600">
                                    KES {product.price?.toLocaleString()}
                                </span>
                            </Link>
                        ))}

                        {/* View All Link */}
                        <Link
                            to={`/shop?search=${encodeURIComponent(query)}`}
                            className="block p-3 text-center text-sm text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-700 border-t dark:border-slate-700"
                        >
                            View all results for "{query}"
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No Results */}
            <AnimatePresence>
                {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border dark:border-slate-700 text-center text-slate-500"
                    >
                        No products found for "{query}"
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchAutocomplete;
