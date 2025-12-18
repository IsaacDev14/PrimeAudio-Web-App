import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Truck, Package, CreditCard, Smartphone, Building2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const Checkout = () => {
    const { user, loading } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const toast = useToast();

    const [step, setStep] = useState(1); // 1: shipping, 2: payment, 3: success
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: 'Nairobi',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
    const [bankDetails, setBankDetails] = useState(null);

    // Prefill form with user data
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
            setMpesaPhone(user.phone || '');
        }
    }, [user]);

    // Fetch saved addresses
    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    // Show loading while auth is being checked
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login?redirect=/checkout" replace />;
    }

    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/addresses/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAddresses(data);
                const defaultAddr = data.find(a => a.is_default);
                if (defaultAddr) {
                    selectAddress(defaultAddr);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const selectAddress = (addr) => {
        setSelectedAddress(addr);
        setFormData(prev => ({
            ...prev,
            name: addr.full_name,
            phone: addr.phone,
            address: addr.address_line,
            city: addr.city
        }));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const createOrder = async () => {
        const token = localStorage.getItem('token');

        const orderPayload = {
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            delivery_address: `${formData.address}, ${formData.city}`,
            notes: formData.notes,
            payment_method: paymentMethod,
            total_amount: cartTotal,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        const res = await fetch(`${API_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });

        if (!res.ok) {
            throw new Error('Failed to create order');
        }

        return await res.json();
    };

    const handlePayment = async () => {
        setIsSubmitting(true);
        setPaymentStatus('processing');
        const token = localStorage.getItem('token');
        const toastId = toast.loading('Processing payment...');

        try {
            // First create the order
            const order = await createOrder();
            setOrderData(order);

            if (paymentMethod === 'mpesa') {
                // Initiate M-Pesa STK Push
                const res = await fetch(`${API_URL}/payments/mpesa/initiate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: order.id,
                        phone: mpesaPhone
                    })
                });

                const result = await res.json();

                if (result.success) {
                    // Simulate waiting for payment (in production, use webhooks)
                    toast.dismiss(toastId);
                    toast.success('Payment successful!');
                    setPaymentStatus('success');
                    clearCart();
                    setStep(3);
                } else {
                    toast.dismiss(toastId);
                    toast.error('M-Pesa payment failed to initiate');
                    setPaymentStatus('failed');
                }
            } else if (paymentMethod === 'card') {
                // Initialize card payment
                const res = await fetch(`${API_URL}/payments/card/initiate`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        order_id: order.id,
                        email: formData.email,
                        callback_url: `${window.location.origin}/dashboard/orders/${order.id}`
                    })
                });

                const result = await res.json();

                if (result.success && result.authorization_url) {
                    toast.dismiss(toastId);
                    toast.info('Redirecting to payment gateway...');
                    // Redirect to payment page
                    window.location.href = result.authorization_url;
                } else {
                    toast.dismiss(toastId);
                    toast.error('Card payment failed to initialize');
                    setPaymentStatus('failed');
                }
            } else if (paymentMethod === 'bank_transfer') {
                // Get bank transfer details
                const res = await fetch(`${API_URL}/payments/bank-transfer/info`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ order_id: order.id })
                });

                const result = await res.json();

                if (result.success) {
                    toast.dismiss(toastId);
                    toast.success('Order placed! Please complete the transfer.');
                    setBankDetails(result);
                    setPaymentStatus('success');
                    clearCart();
                    setStep(3);
                } else {
                    toast.dismiss(toastId);
                    toast.error('Failed to get bank details');
                    setPaymentStatus('failed');
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.dismiss(toastId);
            toast.error('An error occurred during payment');
            setPaymentStatus('failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (step === 3) {
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
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Thank you for shopping with Prime Audio Solutions.
                </p>

                {orderData && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-md mx-auto mb-6">
                        <p className="text-gray-700 mb-2">
                            <span className="font-medium">Order ID:</span> #{orderData.id}
                        </p>
                        {orderData.tracking_id && (
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Tracking ID:</span> {orderData.tracking_id}
                            </p>
                        )}
                        <p className="text-gray-700">
                            <span className="font-medium">Total:</span> KSh {cartTotal.toLocaleString()}
                        </p>
                    </div>
                )}

                {paymentMethod === 'bank_transfer' && bankDetails && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 max-w-md mx-auto mb-6 text-left">
                        <h3 className="font-bold text-blue-800 mb-3">Bank Transfer Details</h3>
                        <p className="text-sm text-blue-700 mb-2"><strong>Bank:</strong> {bankDetails.bank_details.bank_name}</p>
                        <p className="text-sm text-blue-700 mb-2"><strong>Account Name:</strong> {bankDetails.bank_details.account_name}</p>
                        <p className="text-sm text-blue-700 mb-2"><strong>Account Number:</strong> {bankDetails.bank_details.account_number}</p>
                        <p className="text-sm text-blue-700 mb-2"><strong>Reference:</strong> {bankDetails.reference}</p>
                        <p className="text-sm text-blue-700"><strong>Amount:</strong> KSh {bankDetails.amount?.toLocaleString()}</p>
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <Link to="/dashboard/orders" className="bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium">
                        View Orders
                    </Link>
                    <Link to="/shop" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    // Login required screen
    if (!user) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center bg-gray-50 min-h-screen">
                <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
                <p className="text-gray-500 mb-6">Please login to continue with checkout</p>
                <Link to="/login?redirect=/checkout" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Login to Continue
                </Link>
            </div>
        );
    }

    // Empty cart
    if (cart.length === 0 && step === 1) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-4 text-center bg-gray-50 min-h-screen">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-6">Add some products before checkout</p>
                <Link to="/shop" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                        <span className="font-medium hidden sm:inline">Shipping</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-200"></div>
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                        <span className="font-medium hidden sm:inline">Payment</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-200"></div>
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
                        <span className="font-medium hidden sm:inline">Complete</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    {step === 1 ? 'Shipping Information' : 'Payment Method'}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {step === 1 ? (
                            // Shipping Step
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                {/* Saved Addresses */}
                                {addresses.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-medium text-gray-900 mb-3">Saved Addresses</h3>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {addresses.map(addr => (
                                                <button
                                                    key={addr.id}
                                                    type="button"
                                                    onClick={() => selectAddress(addr)}
                                                    className={`p-4 rounded-lg border-2 text-left transition-all ${selectedAddress?.id === addr.id
                                                        ? 'border-blue-600 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <p className="font-medium text-gray-900">{addr.label}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{addr.full_name}</p>
                                                    <p className="text-sm text-gray-500">{addr.address_line}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleShippingSubmit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm font-medium">Full Name *</label>
                                            <input
                                                required
                                                type="text"
                                                name="name"
                                                value={formData.name || ''}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm font-medium">Phone *</label>
                                            <input
                                                required
                                                type="tel"
                                                name="phone"
                                                value={formData.phone || ''}
                                                onChange={handleInputChange}
                                                placeholder="+254 700 000 000"
                                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-1 text-sm font-medium">Email *</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-1 text-sm font-medium">Delivery Address *</label>
                                        <textarea
                                            required
                                            name="address"
                                            value={formData.address || ''}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Street address, building, floor..."
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-1 text-sm font-medium">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-1 text-sm font-medium">Order Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            placeholder="Any special instructions..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
                                    >
                                        Continue to Payment
                                    </button>
                                </form>
                            </div>
                        ) : (
                            // Payment Step
                            <div className="space-y-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Shipping
                                </button>

                                {/* Payment Methods */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>

                                    <div className="space-y-3">
                                        {/* M-Pesa */}
                                        <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'mpesa' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="mpesa"
                                                checked={paymentMethod === 'mpesa'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-5 h-5 text-green-600"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                                    <Smartphone className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">M-Pesa</p>
                                                    <p className="text-sm text-gray-500">Pay via STK Push</p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Card */}
                                        <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="card"
                                                checked={paymentMethod === 'card'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-5 h-5 text-blue-600"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Credit/Debit Card</p>
                                                    <p className="text-sm text-gray-500">Visa, Mastercard</p>
                                                </div>
                                            </div>
                                        </label>

                                        {/* Bank Transfer */}
                                        <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="bank_transfer"
                                                checked={paymentMethod === 'bank_transfer'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-5 h-5 text-purple-600"
                                            />
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Bank Transfer</p>
                                                    <p className="text-sm text-gray-500">Manual bank payment</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* M-Pesa Phone Input */}
                                {paymentMethod === 'mpesa' && (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-3">M-Pesa Phone Number</h3>
                                        <input
                                            type="tel"
                                            value={mpesaPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            placeholder="0712 345 678"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <p className="text-sm text-gray-500 mt-2">
                                            Enter the phone number to receive the STK push
                                        </p>
                                    </div>
                                )}

                                {/* Complete Payment Button */}
                                <button
                                    onClick={handlePayment}
                                    disabled={isSubmitting || (paymentMethod === 'mpesa' && !mpesaPhone)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>Complete Payment - KSh {cartTotal.toLocaleString()}</>
                                    )}
                                </button>

                                {paymentStatus === 'failed' && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                                        <p className="font-medium">Payment failed. Please try again.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                            {item.image_url && (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            KSh {(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>KSh {cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-blue-600">KSh {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-700">
                                🔒 Your payment and personal information are secure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
