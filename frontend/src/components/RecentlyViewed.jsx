import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 10;

// Hook to manage recently viewed products
export const useRecentlyViewed = () => {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    const addItem = (product) => {
        if (!product?.id) return;

        setItems(prev => {
            const filtered = prev.filter(p => p.id !== product.id);
            const updated = [
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url,
                    category: product.category,
                    viewedAt: Date.now()
                },
                ...filtered
            ].slice(0, MAX_ITEMS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearItems = () => {
        setItems([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { items, addItem, clearItems };
};

// Recently Viewed Carousel Component
const RecentlyViewed = ({ className = "" }) => {
    const { items } = useRecentlyViewed();
    const [scrollPosition, setScrollPosition] = useState(0);

    if (items.length === 0) return null;

    const scroll = (direction) => {
        const container = document.getElementById('recently-viewed-container');
        if (container) {
            const scrollAmount = direction === 'left' ? -280 : 280;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            setScrollPosition(container.scrollLeft + scrollAmount);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Recently Viewed
                    </h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div
                id="recently-viewed-container"
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            to={`/shop/${product.id}`}
                            className="flex-shrink-0 w-48 group"
                        >
                            <div className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 aspect-square">
                                <img
                                    src={product.image_url || '/placeholder.jpg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="mt-2">
                                <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h4>
                                <p className="text-blue-600 font-bold text-sm">
                                    KES {product.price?.toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
