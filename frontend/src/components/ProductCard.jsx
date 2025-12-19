import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const ProductCard = ({ product }) => {
    const { isAuthenticated } = useAuth();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Define images with fallback
    const images = (product.images && product.images.length > 0) ? product.images : [product.image_url];

    // Check if product is in wishlist
    useEffect(() => {
        if (isAuthenticated) {
            checkWishlist();
        }
    }, [isAuthenticated, product.id]);

    const checkWishlist = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/wishlist/check/${product.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setIsInWishlist(data.in_wishlist);
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login or show message
            window.location.href = '/login?redirect=' + window.location.pathname;
            return;
        }

        setIsWishlistLoading(true);

        try {
            if (isInWishlist) {
                // Remove from wishlist
                await fetch(`${API_URL}/wishlist/${product.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsInWishlist(false);
            } else {
                // Add to wishlist
                await fetch(`${API_URL}/wishlist/${product.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsInWishlist(true);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Navigation handlers
    const nextImage = (e) => {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <motion.div
            className="group block bg-white rounded-xl overflow-hidden cursor-pointer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <div className="relative h-64 overflow-hidden bg-gray-100 rounded-xl">
                <Link to={`/shop/${product.id}`}>
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            alt={product.name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>
                </Link>

                {/* Top Badges */}
                {product.rating >= 4.8 && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm z-10 text-xs font-bold text-slate-900 border border-black/5">
                        Guest favorite
                    </div>
                )}

                <button
                    onClick={toggleWishlist}
                    disabled={isWishlistLoading}
                    className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full transition-all z-10 ${isInWishlist
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-black/50 hover:bg-black/70 text-white'
                        } ${isWishlistLoading ? 'opacity-50' : ''}`}
                >
                    <Heart className={`w-4 h-4 stroke-2 ${isInWishlist ? 'fill-white' : ''}`} />
                </button>

                {/* Navigation Buttons (Always visible) */}
                <>
                    <button
                        onClick={prevImage}
                        className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 bg-white/60 backdrop-blur-md hover:bg-white rounded-full text-slate-900 shadow-md transition-all z-20 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-white/60 backdrop-blur-md hover:bg-white rounded-full text-slate-900 shadow-md transition-all z-20"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>

                {/* Carousel Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-3 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-tight line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-0.5 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm text-gray-700">{product.rating || 0}</span>
                    </div>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2">{product.description || "Professional audio equipment"}</p>
                <p className="font-bold text-gray-900 text-lg">KSh {product.price?.toLocaleString()}</p>
            </div>
        </motion.div>
    );
};

export default ProductCard;
