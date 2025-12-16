import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ChevronRight, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';

const HotDeals = ({ limit = 4 }) => {
    const [activeOffer, setActiveOffer] = useState(null);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchActiveOffer();
    }, []);

    // Only fetch deals if there's an active offer
    useEffect(() => {
        if (activeOffer) {
            fetchDeals();
        } else {
            setLoading(false);
        }
    }, [activeOffer]);

    const fetchActiveOffer = async () => {
        try {
            const response = await fetch(`${API_URL}/offers/active`);
            if (response.ok) {
                const offers = await response.json();
                if (offers.length > 0) {
                    setActiveOffer(offers[0]);
                } else {
                    setActiveOffer(null);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching active offer:', error);
            setLoading(false);
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await fetch(`${API_URL}/offers/products-on-sale`);
            if (response.ok) {
                const data = await response.json();
                // Deduplicate products by ID to prevent duplicate key warnings
                const uniqueDeals = data.reduce((acc, deal) => {
                    if (!acc.find(d => d.id === deal.id)) {
                        acc.push(deal);
                    }
                    return acc;
                }, []);
                setDeals(uniqueDeals.slice(0, limit));
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    };

    // Only show if we have an active offer AND deals
    if (loading || !activeOffer || deals.length === 0) return null;

    return (
        <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Compact Animated Header with Offer Title */}
            <div className="relative mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 overflow-hidden">
                {/* Animated background sparkles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
                            style={{
                                left: `${15 + i * 15}%`,
                                top: `${20 + (i % 3) * 25}%`,
                            }}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                            }}
                        />
                    ))}
                </div>

                <div className="relative flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        {/* Animated flame icon */}
                        <motion.div
                            className="bg-white/20 backdrop-blur-sm p-2 rounded-lg"
                            animate={{
                                rotate: [-5, 5, -5],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Flame className="w-5 h-5 text-white" />
                        </motion.div>
                        <div className="text-white">
                            <motion.h2
                                className="text-base md:text-lg font-bold flex items-center gap-1.5"
                            >
                                {activeOffer?.title || '🔥 Hot Deals'}
                                <Sparkles className="w-4 h-4" />
                            </motion.h2>
                            <p className="text-xs text-white/80">
                                {activeOffer?.description || 'Limited time offers'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeOffer?.discount_percentage && (
                            <motion.div
                                className="bg-white text-red-600 font-bold px-3 py-1 rounded-full text-sm"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                -{activeOffer.discount_percentage}% OFF
                            </motion.div>
                        )}

                        <Link
                            to="/shop?sale=true"
                            className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                            View All
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {deals.map((deal, index) => (
                    <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                    >
                        <Link
                            to={`/product/${deal.id}`}
                            className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all"
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <img
                                    src={deal.image_url || '/placeholder.jpg'}
                                    alt={deal.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <motion.div
                                    className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    -{deal.discount_percentage}%
                                </motion.div>
                                {deal.offer_end_date && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Clock size={10} />
                                        <span>Limited</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                                    {deal.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">{deal.category}</p>

                                <div className="space-y-1">
                                    <span className="text-gray-400 text-sm line-through block">
                                        KSh {deal.original_price?.toLocaleString()}
                                    </span>
                                    <span className="text-red-600 font-bold text-lg block">
                                        KSh {deal.sale_price?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default HotDeals;
