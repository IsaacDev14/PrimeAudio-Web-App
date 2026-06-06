import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config/api';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    Truck,
    Package,
    Heart,
    MessageSquare,
    TrendingUp,
    Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AppIcon } from '../../components/ui/app-icon';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        wishlistItems: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');

        try {
            // Fetch orders
            const ordersRes = await fetch(`${API_URL}/orders/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const orders = await ordersRes.json();

            if (Array.isArray(orders)) {
                setRecentOrders(orders.slice(0, 5));
                setStats(prev => ({
                    ...prev,
                    totalOrders: orders.length,
                    pendingOrders: orders.filter(o => o.status === 'pending').length,
                    deliveredOrders: orders.filter(o => o.status === 'delivered').length
                }));
            }

            // Fetch wishlist count
            const wishlistRes = await fetch(`${API_URL}/wishlist/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const wishlist = await wishlistRes.json();
            if (Array.isArray(wishlist)) {
                setStats(prev => ({ ...prev, wishlistItems: wishlist.length }));
            }

            // Fetch notifications
            const notifRes = await fetch(`${API_URL}/notifications/?limit=5`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const notifs = await notifRes.json();
            if (Array.isArray(notifs)) {
                setNotifications(notifs);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
            delivered: CheckCircle
        };
        return icons[status] || Clock;
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || 'Customer'}! 👋</h1>
                <p className="text-blue-100 mt-1">Here's what's happening with your orders.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/dashboard/orders" className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <AppIcon icon={ShoppingBag} size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                            <p className="text-sm text-gray-500">Total Orders</p>
                        </div>
                    </div>
                </Link>

                <Link to="/dashboard/orders?status=pending" className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <AppIcon icon={Clock} size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                            <p className="text-sm text-gray-500">Pending</p>
                        </div>
                    </div>
                </Link>

                <Link to="/dashboard/orders?status=delivered" className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <AppIcon icon={CheckCircle} size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                            <p className="text-sm text-gray-500">Delivered</p>
                        </div>
                    </div>
                </Link>

                <Link to="/dashboard/wishlist" className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <AppIcon icon={Heart} size="lg" />
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                            <p className="text-sm text-gray-500">Wishlist</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                        <Link to="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700">
                            View All →
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <AppIcon icon={ShoppingBag} size="2xl" className="text-slate-300 mx-auto mb-3" />
                            <p className="text-gray-500">No orders yet</p>
                            <Link to="/shop" className="text-blue-600 text-sm hover:underline">
                                Start shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.status);
                                return (
                                    <Link
                                        key={order.id}
                                        to={`/dashboard/orders/${order.id}`}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AppIcon icon={StatusIcon} />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Order #{order.tracking_id || order.id}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <p className="text-sm text-gray-900 font-medium mt-1">
                                                KSh {order.total_amount?.toLocaleString()}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Notifications</h2>
                        <Bell className="w-5 h-5 text-gray-400" />
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <AppIcon icon={Bell} size="2xl" className="text-slate-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 ${notif.is_read ? 'bg-white' : 'bg-blue-50'}`}
                                >
                                    <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    to="/shop"
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                    <AppIcon icon={TrendingUp} />
                    <span className="font-medium text-gray-700">Browse Products</span>
                </Link>
                <Link
                    to="/dashboard/messages"
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                    <AppIcon icon={MessageSquare} />
                    <span className="font-medium text-gray-700">Contact Support</span>
                </Link>
                <Link
                    to="/track-order"
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                    <AppIcon icon={Truck} />
                    <span className="font-medium text-gray-700">Track Order</span>
                </Link>
                <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                    <AppIcon icon={Package} />
                    <span className="font-medium text-gray-700">Edit Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default CustomerDashboard;
