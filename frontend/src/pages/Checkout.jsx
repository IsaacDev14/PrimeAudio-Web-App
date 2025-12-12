import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Truck, Package } from 'lucide-react';
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
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (step === 2) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center bg-gray-50 min-h-screen">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 text-white"
                >
                    <CheckCircle size={50} />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Thank you for shopping with Prime Audio Solutions. Your order #ORD-{Math.floor(Math.random() * 10000)} has been received and is being processed.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/track-order" className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
                        Track Order
                    </Link>
                    <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            Shipping Information
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-1 text-sm font-medium">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 transition-all"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1 text-sm font-medium">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1 text-sm font-medium">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 transition-all"
                                    placeholder="+254 700 000 000"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-1 text-sm font-medium">Delivery Address</label>
                                <textarea
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 transition-all resize-none"
                                    placeholder="Street address, building, floor..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mt-4 transition-colors"
                            >
                                Complete Order
                            </button>
                        </form>
                    </div>

                    {/* Order Info */}
                    <div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Order Summary
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium text-gray-900">KSh {cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="h-px bg-gray-200"></div>
                                <div className="flex justify-between items-center text-xl">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-blue-600">KSh {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-700">
                                🔒 Your payment and personal information are secure. Free delivery for orders over KSh 5,000.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
