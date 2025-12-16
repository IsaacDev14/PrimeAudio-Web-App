import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    MapPin,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react';
import { API_URL } from '../../config/api';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setOrder(data);
            } else {
                navigate('/dashboard/orders');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-blue-100 text-blue-700',
            processing: 'bg-purple-100 text-purple-700',
            shipped: 'bg-indigo-100 text-indigo-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            approved: CheckCircle,
            processing: Package,
            shipped: Truck,
            delivered: CheckCircle,
            cancelled: XCircle
        };
        return icons[status] || Clock;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
                <Link to="/dashboard/orders" className="text-blue-600 hover:underline">
                    Back to orders
                </Link>
            </div>
        );
    }

    const StatusIcon = getStatusIcon(order.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to Orders</span>
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                            Order #{order.tracking_id || order.id}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            <StatusIcon className="w-4 h-4 inline mr-1" />
                            {order.status}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900">Order Items</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {order.items?.length > 0 ? (
                            order.items.map((item, index) => (
                                <div key={item.id || index} className="p-4 flex gap-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.product?.image_url || item.image_url || '/placeholder.jpg'}
                                            alt={item.product?.name || item.name || 'Product'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {item.product?.name || item.name || 'Product'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity}
                                        </p>
                                        {item.product?.category && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {item.product.category}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">
                                            KSh {(item.price * item.quantity).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            KSh {item.price?.toLocaleString()} each
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p>No items found for this order</p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900">KSh {order.total_amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-gray-900">KSh {order.shipping_cost?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span className="text-blue-600">KSh {order.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Info Sidebar */}
                <div className="space-y-4">
                    {/* Shipping Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            Shipping Address
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-gray-900">
                                {order.shipping_address?.name || order.full_name || 'N/A'}
                            </p>
                            <p>{order.shipping_address?.address || order.address || 'No address provided'}</p>
                            <p>{order.shipping_address?.city || order.city}, {order.shipping_address?.postal_code || ''}</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{order.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{order.email || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            Payment
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="text-gray-900 capitalize">{order.payment_method || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-medium ${order.payment_status === 'paid'
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                                    }`}>
                                    {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Track Order Button */}
                    <Link
                        to={`/track-order?id=${order.tracking_id || order.id}`}
                        className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Truck className="w-4 h-4 inline mr-2" />
                        Track Order
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
