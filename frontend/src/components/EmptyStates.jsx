import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    Package,
    Heart,
    MessageCircle,
    Search,
    Bell,
    MapPin
} from 'lucide-react';

// Empty Cart State
export const EmptyCart = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
    >
        <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-blue-500" />
            </div>
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center"
            >
                <span className="text-lg">🛒</span>
            </motion.div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Looks like you haven't added anything yet. Let's fix that!
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
            Start Shopping
        </Link>
    </motion.div>
);

// Empty Orders State
export const EmptyOrders = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
    >
        <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-green-500" />
            </div>
            <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center"
            >
                <span className="text-xl">📦</span>
            </motion.div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            You haven't placed any orders. Find something you love!
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
        >
            Browse Products
        </Link>
    </motion.div>
);

// Empty Wishlist State
export const EmptyWishlist = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
    >
        <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
                <span className="text-lg">❤️</span>
            </motion.div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wishlist is empty</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Save items you love to your wishlist for later.
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-colors"
        >
            Discover Products
        </Link>
    </motion.div>
);

// Empty Messages State
export const EmptyMessages = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
    >
        <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center">
                <MessageCircle className="w-12 h-12 text-purple-500" />
            </div>
            <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center"
            >
                <span className="text-lg">💬</span>
            </motion.div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No messages</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Start a conversation with our support team.
        </p>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors">
            Start Conversation
        </button>
    </motion.div>
);

// Empty Search Results
export const EmptySearchResults = ({ query }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4"
    >
        <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-slate-400" />
            </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            We couldn't find any products matching "{query}".
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
        >
            View All Products
        </Link>
    </motion.div>
);

// Empty Notifications State
export const EmptyNotifications = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-4"
    >
        <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            No new notifications right now.
        </p>
    </motion.div>
);

// Empty Addresses State
export const EmptyAddresses = ({ onAdd }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl"
    >
        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-teal-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No addresses saved</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
            Add a delivery address for faster checkout.
        </p>
        <button
            onClick={onAdd}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
            Add Address
        </button>
    </motion.div>
);
