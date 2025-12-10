import { useState } from 'react';
import { Search, Package, Check, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const OrderTracking = () => {
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState(null); // null, 'loading', 'found'

    const handleTrack = (e) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('found');
        }, 1500);
    };

    return (
        <div className="pt-24 pb-20 container mx-auto px-4 min-h-[80vh]">
            <h1 className="text-3xl font-bold mb-8 text-center">Track Your Order</h1>

            <div className="max-w-xl mx-auto mb-12">
                <form onSubmit={handleTrack} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Enter Order ID (e.g., ORD-1234)"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="flex-1 bg-dark-card border border-white/10 rounded-lg px-4 py-3 focus:border-prime-blue focus:outline-none"
                    />
                    <button disabled={!orderId} type="submit" className="btn-primary px-6 rounded-lg disabled:opacity-50">
                        <Search size={20} />
                    </button>
                </form>
            </div>

            {status === 'loading' && (
                <div className="flex justify-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-prime-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {status === 'found' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto bg-dark-card p-8 rounded-2xl border border-white/5"
                >
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                        <div>
                            <h2 className="text-xl font-bold">Order #{orderId}</h2>
                            <p className="text-gray-400">Placed on Oct 12, 2023</p>
                        </div>
                        <span className="bg-prime-blue/20 text-prime-blue px-3 py-1 rounded-full text-sm font-bold">In Transit</span>
                    </div>

                    <div className="space-y-8 relative">
                        {/* Progress Line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/10"></div>

                        {[
                            { title: "Order Placed", date: "Oct 12, 10:00 AM", done: true, icon: <Check size={16} /> },
                            { title: "Processing", date: "Oct 12, 02:30 PM", done: true, icon: <Check size={16} /> },
                            { title: "Shipped", date: "Oct 13, 09:15 AM", done: true, current: true, icon: <Truck size={16} /> },
                            { title: "Delivered", date: "Expected Oct 14", done: false, icon: <Package size={16} /> }
                        ].map((step, i) => (
                            <div key={i} className="flex items-start gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-dark-card ${step.done || step.current ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${step.current ? 'text-green-400' : 'text-white'}`}>{step.title}</h3>
                                    <p className="text-sm text-gray-400">{step.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default OrderTracking;
