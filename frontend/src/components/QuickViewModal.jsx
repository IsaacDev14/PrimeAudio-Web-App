import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [currentImage, setCurrentImage] = useState(0);
    const [isAdded, setIsAdded] = useState(false);

    const images = product?.images?.length > 0
        ? product.images
        : [product?.image_url || '/placeholder.jpg'];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuantity(1);
            setCurrentImage(0);
            setIsAdded(false);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => {
            setIsAdded(false);
            onClose();
        }, 1500);
    };

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-slate-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Image Section */}
                            <div className="relative bg-slate-100 dark:bg-slate-900 aspect-square">
                                <img
                                    src={images[currentImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />

                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>

                                        {/* Image Dots */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentImage(idx)}
                                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentImage ? 'bg-blue-600' : 'bg-white/60'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="p-6 md:p-8 flex flex-col">
                                <div className="flex-1">
                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                        {product.category}
                                    </span>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                        {product.name}
                                    </h2>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product.rating || 0)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-slate-500">
                                            ({product.review_count || 0} reviews)
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                            KES {product.price?.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="mt-4 text-slate-600 dark:text-slate-300 line-clamp-4">
                                        {product.description}
                                    </p>

                                    {/* Stock */}
                                    <div className="mt-4">
                                        {product.stock > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                                <Check className="w-4 h-4" />
                                                In Stock ({product.stock} available)
                                            </span>
                                        ) : (
                                            <span className="text-sm text-red-600">Out of Stock</span>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity & Add to Cart */}
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Quantity:</span>
                                        <div className="flex items-center border dark:border-slate-600 rounded-lg">
                                            <button
                                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                                className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-2 font-medium">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(prev => Math.min(product.stock || 10, prev + 1))}
                                                className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleAddToCart}
                                            disabled={product.stock === 0 || isAdded}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${isAdded
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <Check className="w-5 h-5" />
                                                    Added!
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5" />
                                                    Add to Cart
                                                </>
                                            )}
                                        </motion.button>

                                        <button className="p-3 border dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QuickViewModal;
