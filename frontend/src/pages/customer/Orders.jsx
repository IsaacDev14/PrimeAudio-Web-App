import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';
import {
    ShoppingBag,
    Search,
    Filter,
    Clock,
    CheckCircle,
    Truck,
    Package,
    XCircle,
    ChevronRight,
    Eye
} from 'lucide-react';

const CustomerOrders = () => {
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/orders/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                console.log("Fetched orders:", data);
                setOrders(data);
            } else {
                console.error("Orders data is not an array:", data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            approved: 'bg-blue-100 text-blue-700 border-blue-200',
            processing: 'bg-purple-100 text-purple-700 border-purple-200',
            shipped: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            delivered: 'bg-green-100 text-green-700 border-green-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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

    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);

        const matchesStatus = selectedStatus === 'all' ||
            (order.status && order.status.toLowerCase() === selectedStatus.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-500 mt-1">Track and manage your orders</p>
                </div>
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Continue Shopping
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID or tracking number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-3">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || selectedStatus !== 'all'
                                ? 'Try adjusting your filters'
                                : "You haven't placed any orders yet"}
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                        >
                            Browse products <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => {
                            const StatusIcon = getStatusIcon(order.status);
                            return (
                                <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-lg ${getStatusColor(order.status).split(' ')[0]}`}>
                                                <StatusIcon className={`w-6 h-6 ${getStatusColor(order.status).split(' ')[1]}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold text-gray-900">
                                                        Order #{order.tracking_id || order.id}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {order.items && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    KSh {order.total_amount?.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {order.payment_status === 'paid' ? '✓ Paid' : 'Payment Pending'}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/dashboard/orders/${order.id}`}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline">View</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrders;
