import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Checkout = () => {
    const { cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        city: "Nairobi",
        phone: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(2);
        clearCart();
        // In real app, send data to backend here
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (step === 2) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 text-white"
                >
                    <CheckCircle size={50} />
                </motion.div>
                <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Thank you for shopping with Prime Audio Solutions. Your order #ORD-{Math.floor(Math.random() * 10000)} has been received and is being processed.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/track-order" className="bg-dark-card border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                        Track Order
                    </Link>
                    <Link to="/" className="btn-primary px-6 py-3 rounded-lg">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Form */}
                <div className="bg-dark-card p-6 rounded-xl border border-white/5">
                    <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Full Name</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 focus:border-prime-blue focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Email Address</label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 focus:border-prime-blue focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Phone Number</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 focus:border-prime-blue focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Delivery Address</label>
                            <textarea
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 focus:border-prime-blue focus:outline-none"
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full btn-primary py-3 rounded-lg font-bold mt-4">
                            Complete Order
                        </button>
                    </form>
                </div>

                {/* Order Info */}
                <div>
                    <div className="bg-dark-bg p-6 rounded-xl border border-white/10">
                        <h2 className="text-xl font-bold mb-6">Order Total</h2>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="font-bold">KSh {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400">Delivery Fee</span>
                            <span className="text-green-400">Free</span>
                        </div>
                        <div className="h-px bg-white/10 mb-6"></div>
                        <div className="flex justify-between items-center text-2xl font-bold">
                            <span>Total</span>
                            <span className="text-prime-blue">KSh {cartTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
