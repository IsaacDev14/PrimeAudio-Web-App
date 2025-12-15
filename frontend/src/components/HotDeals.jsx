import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

const HotDeals = ({ limit = 4 }) => {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const response = await fetch(`${API_URL}/offers/products-on-sale`);
            if (response.ok) {
                const data = await response.json();
                setDeals(data.slice(0, limit));
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || deals.length === 0) return null;

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Hot Deals</h2>
                        <p className="text-sm text-gray-500">Limited time offers</p>
                    </div>
                </div>
                <Link
                    to="/shop?sale=true"
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 font-medium"
                >
                    View All
                    <ChevronRight size={16} />
                </Link>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {deals.map((deal, index) => (
                    <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            to={`/product/${deal.id}`}
                            className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <img
                                    src={deal.image_url || '/placeholder.jpg'}
                                    alt={deal.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Discount Badge */}
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    -{deal.discount_percentage}%
                                </div>
                                {/* Timer */}
                                {deal.offer_end_date && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Clock size={10} />
                                        <span>Limited</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                                    {deal.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">{deal.category}</p>

                                {/* Prices */}
                                <div className="flex items-center gap-2">
                                    <span className="text-red-600 font-bold">
                                        KSh {deal.sale_price?.toLocaleString()}
                                    </span>
                                    <span className="text-gray-400 text-sm line-through">
                                        KSh {deal.original_price?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HotDeals;
