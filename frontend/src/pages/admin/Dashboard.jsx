import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle, Truck, PackageCheck, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('all');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });

    const periods = [
        { value: 'day', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'all', label: 'All Time' },
        { value: 'custom', label: 'Custom' },
    ];

    useEffect(() => {
        fetchDashboardData();
    }, [period, customDates]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            // Build query params
            let queryParams = `period=${period}`;
            if (period === 'custom' && customDates.start && customDates.end) {
                queryParams = `start_date=${customDates.start}&end_date=${customDates.end}`;
            }

            // Fetch stats
            const statsRes = await fetch(`http://localhost:8000/orders/stats?${queryParams}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch recent orders
            const ordersRes = await fetch('http://localhost:8000/orders/?limit=10', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setRecentOrders(ordersData);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'outline';
            case 'approved': return 'default';
            case 'Processing': return 'secondary';
            case 'Shipped': return 'default';
            case 'Delivered': return 'outline';
            case 'Cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    const formatCurrency = (amount) => {
        return `KES ${(amount || 0).toLocaleString()}`;
    };

    const statCards = stats ? [
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.total_revenue),
            icon: DollarSign,
            color: 'text-green-600 bg-green-100',
            description: `From ${stats.total_orders} orders`
        },
        {
            title: 'Total Orders',
            value: stats.total_orders?.toLocaleString() || '0',
            icon: ShoppingBag,
            color: 'text-blue-600 bg-blue-100',
            description: 'All orders in period'
        },
        {
            title: 'Products in Stock',
            value: stats.products_in_stock?.toLocaleString() || '0',
            icon: Package,
            color: 'text-purple-600 bg-purple-100',
            description: 'Total inventory'
        },
        {
            title: 'Active Users',
            value: stats.active_users?.toLocaleString() || '0',
            icon: Users,
            color: 'text-orange-600 bg-orange-100',
            description: 'Registered accounts'
        },
    ] : [];

    const orderStatCards = stats ? [
        { title: 'Pending Approval', value: stats.pending_orders || 0, icon: Clock, color: 'text-yellow-600' },
        { title: 'Approved', value: stats.approved_orders || 0, icon: CheckCircle, color: 'text-blue-600' },
        { title: 'Shipped', value: stats.shipped_orders || 0, icon: Truck, color: 'text-indigo-600' },
        { title: 'Delivered', value: stats.delivered_orders || 0, icon: PackageCheck, color: 'text-green-600' },
    ] : [];

    if (isLoading && !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Date Filter */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Period:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {periods.map((p) => (
                        <Button
                            key={p.value}
                            variant={period === p.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPeriod(p.value)}
                        >
                            {p.label}
                        </Button>
                    ))}
                </div>
                {period === 'custom' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={customDates.start}
                            onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                            type="date"
                            value={customDates.end}
                            onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                        />
                        <Button size="sm" onClick={fetchDashboardData}>Apply</Button>
                    </div>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Order Status Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
                {orderStatCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="bg-slate-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <Icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Recent Orders</span>
                        <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/orders'}>
                            View All
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No orders found for this period.
                        </div>
                    ) : (
                        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Tracking ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id}</TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {order.tracking_id || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
