import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Define images with fallback
    const images = product.images || [product.image_url];

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

                <button className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors z-10">
                    <Heart className="w-4 h-4 text-white stroke-2" />
                </button>

                {/* Navigation Buttons (Visible on Hover) */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute top-1/2 left-2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 bg-white/90 hover:bg-white rounded-full text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}

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

            <div className="mt-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-[15px] leading-tight line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-black text-black" />
                        <span className="text-sm font-light text-slate-900">{product.rating}</span>
                    </div>
                </div>
                <p className="text-slate-500 text-sm font-light mt-0.5">{product.condition || "In Stock"}</p>
                <div className="flex flex-col mt-1">
                    <p className="text-slate-500 text-sm line-clamp-2 font-light">{product.description || "Professional audio equipment"}</p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="font-bold text-slate-900">KSh {product.price.toLocaleString()}</span>
                        <span className="text-slate-500 text-sm font-light">total</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
