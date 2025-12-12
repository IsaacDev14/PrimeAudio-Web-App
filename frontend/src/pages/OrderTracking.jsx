import { useState } from 'react';
import { Search, Package, CheckCircle, Truck, MapPin, AlertCircle, Clock, PackageCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderTracking = () => {
    const [trackingId, setTrackingId] = useState('');
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingId.trim()) return;

        setLoading(true);
        setError(null);
        setOrderStatus(null);

        try {
            const response = await fetch(`http://localhost:8000/orders/track/${trackingId.trim()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Order not found. Please check your tracking ID.");
            }

            const order = await response.json();

            // Build history based on status
            const statusFlow = ['pending', 'approved', 'Processing', 'Shipped', 'Delivered'];
            const currentIndex = statusFlow.indexOf(order.status);

            const history = [
                { status: 'Order Placed', date: new Date(order.created_at).toLocaleString(), completed: true },
                { status: 'Approved', date: order.approved_at ? new Date(order.approved_at).toLocaleString() : null, completed: currentIndex >= 1 },
                { status: 'Processing', date: currentIndex >= 2 ? 'In Progress' : null, completed: currentIndex >= 2 },
                { status: 'Shipped', date: currentIndex >= 3 ? 'In Transit' : null, completed: currentIndex >= 3 },
                { status: 'Delivered', date: currentIndex >= 4 ? 'Completed' : null, completed: currentIndex >= 4 },
            ];

            setOrderStatus({
                id: order.tracking_id,
                status: order.status,
                date: new Date(order.created_at).toLocaleDateString(),
                history: history
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'approved': return 'bg-blue-100 text-blue-700';
            case 'Processing': return 'bg-indigo-100 text-indigo-700';
            case 'Shipped': return 'bg-purple-100 text-purple-700';
            case 'Delivered': return 'bg-green-100 text-green-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Track Your Order</h1>
                    <p className="text-slate-600">Enter your tracking ID (e.g., PA-XXXXXXXX) to see the current status of your order.</p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <form onSubmit={handleTrack} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                placeholder="Enter Tracking ID (e.g., PA-1A2B3C4D)"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !trackingId}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? 'Tracking...' : 'Track'}
                        </button>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    <div className="mt-4 text-xs text-slate-400 text-center">
                        You can find your Tracking ID in your order confirmation email or in your account order history.
                    </div>
                </div>

                {/* Tracking Results */}
                <AnimatePresence mode="wait">
                    {orderStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Tracking: {orderStatus.id}</h2>
                                    <p className="text-sm text-slate-500">Order placed on {orderStatus.date}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${getStatusColor(orderStatus.status)}`}>
                                    {orderStatus.status}
                                </div>
                            </div>

                            <div className="p-8">
                                {/* Status Icons */}
                                <div className="flex justify-between items-center mb-8">
                                    {[
                                        { icon: Clock, label: 'Pending' },
                                        { icon: CheckCircle, label: 'Approved' },
                                        { icon: Package, label: 'Processing' },
                                        { icon: Truck, label: 'Shipped' },
                                        { icon: PackageCheck, label: 'Delivered' },
                                    ].map((step, idx) => {
                                        const isCompleted = orderStatus.history[idx]?.completed;
                                        return (
                                            <div key={idx} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                    <step.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-xs mt-2 ${isCompleted ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Timeline */}
                                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-2">
                                    {orderStatus.history.map((event, idx) => (
                                        <div key={idx} className="relative pl-8">
                                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${event.completed ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'} transition-colors`} />
                                            <div className={`text-sm font-bold ${event.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                                {event.status}
                                            </div>
                                            {event.date && (
                                                <div className="text-xs text-slate-500 mt-0.5">{event.date}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderTracking;
