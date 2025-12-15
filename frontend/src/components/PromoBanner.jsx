import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

const PromoBanner = () => {
    const [activeOffer, setActiveOffer] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        // Check if user has dismissed this offer
        const dismissedOffers = JSON.parse(localStorage.getItem('dismissedOffers') || '[]');

        fetchActiveOffer(dismissedOffers);
    }, []);

    useEffect(() => {
        if (!activeOffer) return;

        const updateCountdown = () => {
            const now = new Date();
            const end = new Date(activeOffer.end_date);
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Ended');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [activeOffer]);

    const fetchActiveOffer = async (dismissedOffers) => {
        try {
            const response = await fetch(`${API_URL}/offers/active`);
            if (response.ok) {
                const offers = await response.json();
                // Get the first active offer that hasn't been dismissed
                const validOffer = offers.find(o => !dismissedOffers.includes(o.id));
                if (validOffer) {
                    setActiveOffer(validOffer);
                }
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        }
    };

    const handleDismiss = () => {
        if (activeOffer) {
            const dismissedOffers = JSON.parse(localStorage.getItem('dismissedOffers') || '[]');
            dismissedOffers.push(activeOffer.id);
            localStorage.setItem('dismissedOffers', JSON.stringify(dismissedOffers));
        }
        setIsDismissed(true);
    };

    if (!activeOffer || isDismissed) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative overflow-hidden"
                style={{ backgroundColor: activeOffer.banner_color }}
            >
                <div className="max-w-7xl mx-auto px-4 py-2.5">
                    <div className="flex items-center justify-center gap-4 text-white">
                        {/* Badge */}
                        <span className="hidden sm:inline-flex bg-white/20 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                            {activeOffer.badge_text}
                        </span>

                        {/* Title & Description */}
                        <div className="flex items-center gap-2 text-sm sm:text-base font-medium">
                            <span>{activeOffer.title}</span>
                            {activeOffer.description && (
                                <span className="hidden md:inline text-white/80">
                                    — {activeOffer.description}
                                </span>
                            )}
                        </div>

                        {/* Countdown */}
                        {timeLeft && (
                            <div className="hidden sm:flex items-center gap-1 text-xs bg-black/20 px-2 py-1 rounded-full">
                                <Clock size={12} />
                                <span>{timeLeft}</span>
                            </div>
                        )}

                        {/* Shop Link */}
                        <Link
                            to="/shop?sale=true"
                            className="flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                        >
                            Shop Now
                            <ChevronRight size={14} />
                        </Link>

                        {/* Dismiss Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none" />
            </motion.div>
        </AnimatePresence>
    );
};

export default PromoBanner;
