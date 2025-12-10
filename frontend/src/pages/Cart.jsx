import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-dark-card rounded-full mb-6">
                    <ShoppingBag size={40} className="text-gray-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Looks like you haven't added any instruments to your cart yet. Browse our shop to find your perfect sound.
                </p>
                <Link to="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                    Start Shopping <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cart.length} items)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-dark-card p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-center"
                        >
                            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                <p className="text-sm text-gray-400 mb-2">{item.category}</p>
                                <div className="text-prime-blue font-bold">KSh {item.price.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center gap-4 bg-dark-bg p-2 rounded-lg">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:text-prime-red transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:text-green-500 transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            <div className="text-right min-w-[100px] hidden sm:block">
                                <div className="font-bold">KSh {(item.price * item.quantity).toLocaleString()}</div>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-dark-card p-6 rounded-xl border border-white/5 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-400">
                                <span>Subtotal</span>
                                <span>KSh {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="h-px bg-white/10 my-4"></div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-prime-blue">KSh {cartTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <Link to="/checkout" className="w-full btn-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                            Proceed to Checkout <ArrowRight size={20} />
                        </Link>

                        <div className="mt-4 text-center">
                            <Link to="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
