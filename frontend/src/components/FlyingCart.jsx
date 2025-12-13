import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';

// Context for managing flying cart animations
const FlyingCartContext = createContext();

export const useFlyingCart = () => useContext(FlyingCartContext);

export const FlyingCartProvider = ({ children }) => {
    const [flyingItems, setFlyingItems] = useState([]);

    const triggerFly = (startRect, product) => {
        const id = Date.now();
        const cartIcon = document.getElementById('cart-icon');

        if (!cartIcon) return;

        const endRect = cartIcon.getBoundingClientRect();

        setFlyingItems(prev => [...prev, {
            id,
            product,
            startX: startRect.left + startRect.width / 2,
            startY: startRect.top + startRect.height / 2,
            endX: endRect.left + endRect.width / 2,
            endY: endRect.top + endRect.height / 2
        }]);

        // Remove after animation
        setTimeout(() => {
            setFlyingItems(prev => prev.filter(item => item.id !== id));
        }, 800);
    };

    return (
        <FlyingCartContext.Provider value={{ triggerFly }}>
            {children}
            <FlyingCartOverlay items={flyingItems} />
        </FlyingCartContext.Provider>
    );
};

// Overlay component that renders flying items
const FlyingCartOverlay = ({ items }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {items.map(item => (
                    <motion.div
                        key={item.id}
                        initial={{
                            x: item.startX,
                            y: item.startY,
                            scale: 1,
                            opacity: 1
                        }}
                        animate={{
                            x: item.endX,
                            y: item.endY,
                            scale: 0.3,
                            opacity: 0.8
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.25, 0.1, 0.25, 1]
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-600 shadow-lg flex items-center justify-center">
                            <img
                                src={item.product?.image_url || '/placeholder.jpg'}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// Cart icon with bounce animation
export const AnimatedCartIcon = ({ count = 0, onClick }) => {
    const [bounce, setBounce] = useState(false);

    useEffect(() => {
        if (count > 0) {
            setBounce(true);
            const timer = setTimeout(() => setBounce(false), 300);
            return () => clearTimeout(timer);
        }
    }, [count]);

    return (
        <motion.button
            id="cart-icon"
            onClick={onClick}
            animate={bounce ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
            <ShoppingCart className="w-6 h-6" />
            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
                    >
                        {count > 99 ? '99+' : count}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

// Add to cart button with animation
export const AnimatedAddToCartButton = ({ product, onClick, className = "" }) => {
    const { triggerFly } = useFlyingCart() || {};
    const [isAdded, setIsAdded] = useState(false);

    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        if (triggerFly) {
            triggerFly(rect, product);
        }

        setIsAdded(true);
        onClick?.();

        setTimeout(() => setIsAdded(false), 1500);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${className}`}
        >
            <AnimatePresence mode="wait">
                {isAdded ? (
                    <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-1"
                    >
                        <Check className="w-4 h-4" />
                        Added!
                    </motion.span>
                ) : (
                    <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-1"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
