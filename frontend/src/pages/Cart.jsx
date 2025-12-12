import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const toast = useToast();
    const [itemToRemove, setItemToRemove] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleRemoveItem = () => {
        if (itemToRemove) {
            removeFromCart(itemToRemove.id);
            setItemToRemove(null);
        }
    };

    const handleClearCart = () => {
        clearCart();
        setShowClearConfirm(false);
    };

    if (cart.length === 0) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center bg-gray-50 min-h-screen">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                    <ShoppingBag size={40} className="text-gray-400" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Looks like you haven't added any instruments to your cart yet. Browse our shop to find your perfect sound.
                </p>
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                    Start Shopping <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart ({cart.length} items)</h1>
                    {cart.length > 0 && (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear Cart
                        </button>
                    )}
                </div>

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
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center hover:shadow-md transition-shadow"
                            >
                                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                    <img
                                        src={item.image_url || item.images?.[0]}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                                    <div className="text-blue-600 font-bold">KSh {item.price?.toLocaleString()}</div>
                                </div>

                                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors text-gray-600"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-10 text-center font-medium text-gray-900">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition-colors text-gray-600"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="text-right min-w-[100px] hidden sm:block">
                                    <div className="font-bold text-gray-900">KSh {(item.price * item.quantity).toLocaleString()}</div>
                                </div>

                                <button
                                    onClick={() => setItemToRemove(item)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">KSh {cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-gray-500">Calculated at checkout</span>
                                </div>
                                <div className="h-px bg-gray-200 my-4"></div>
                                <div className="flex justify-between font-bold text-lg">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-blue-600">KSh {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                Proceed to Checkout <ArrowRight size={20} />
                            </Link>

                            <div className="mt-4 text-center">
                                <Link to="/shop" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Remove Item Confirmation */}
            <AlertDialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove "{itemToRemove?.name}" from your cart?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveItem} className="bg-red-600 hover:bg-red-700">
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Clear Cart Confirmation */}
            <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove all {cart.length} items from your cart? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearCart} className="bg-red-600 hover:bg-red-700">
                            Clear All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Cart;
