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
import { AppIcon } from './ui/app-icon';

const emptyStateClass = 'flex flex-col items-center justify-center py-16 px-4';

export const EmptyCart = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={emptyStateClass}
    >
        <AppIcon icon={ShoppingCart} size="2xl" className="text-slate-400 mb-6" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Looks like you haven't added anything yet. Let's fix that!
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
        >
            Start Shopping
        </Link>
    </motion.div>
);

export const EmptyOrders = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={emptyStateClass}
    >
        <AppIcon icon={Package} size="2xl" className="text-slate-400 mb-6" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            You haven't placed any orders. Find something you love!
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
        >
            Browse Products
        </Link>
    </motion.div>
);

export const EmptyWishlist = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={emptyStateClass}
    >
        <AppIcon icon={Heart} size="2xl" className="text-slate-400 mb-6" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wishlist is empty</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Save items you love to your wishlist for later.
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
        >
            Discover Products
        </Link>
    </motion.div>
);

export const EmptyMessages = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={emptyStateClass}
    >
        <AppIcon icon={MessageCircle} size="2xl" className="text-slate-400 mb-6" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No messages</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Start a conversation with our support team.
        </p>
        <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors">
            Start Conversation
        </button>
    </motion.div>
);

export const EmptySearchResults = ({ query }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={emptyStateClass}
    >
        <AppIcon icon={Search} size="2xl" className="text-slate-400 mb-6" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
            We couldn't find any products matching "{query}".
        </p>
        <Link
            to="/shop"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
        >
            View All Products
        </Link>
    </motion.div>
);

export const EmptyNotifications = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 px-4"
    >
        <AppIcon icon={Bell} size="xl" className="text-slate-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">All caught up!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            No new notifications right now.
        </p>
    </motion.div>
);

export const EmptyAddresses = ({ onAdd }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl"
    >
        <AppIcon icon={MapPin} size="xl" className="text-slate-400 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No addresses saved</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
            Add a delivery address for faster checkout.
        </p>
        <button
            onClick={onAdd}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors text-sm"
        >
            Add Address
        </button>
    </motion.div>
);
