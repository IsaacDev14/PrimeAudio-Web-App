import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Loader2, RefreshCcw, CheckCircle, Copy, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { useToast } from "../../context/ToastContext";

const AdminOrders = () => {
    const toast = useToast();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isApproving, setIsApproving] = useState(null);

    const statuses = ['all', 'pending', 'approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = "http://localhost:8000/orders/?limit=100";
            if (statusFilter !== 'all') {
                url += `&status=${statusFilter}`;
            }

            const response = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const approveOrder = async (orderId) => {
        setIsApproving(orderId);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/orders/${orderId}/approve`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
                toast.success(`Order approved! Tracking ID: ${updatedOrder.tracking_id}`);
            } else {
                const error = await response.json();
                toast.error(error.detail || 'Failed to approve order');
            }
        } catch (error) {
            console.error("Failed to approve order:", error);
            toast.error('Failed to approve order');
        } finally {
            setIsApproving(null);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8000/orders/${orderId}/status?status=${newStatus}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error('Failed to update status');
        }
    };

    const copyTrackingId = (trackingId) => {
        navigator.clipboard.writeText(trackingId);
        toast.success(`Copied: ${trackingId}`);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-indigo-100 text-indigo-800';
            case 'Shipped': return 'bg-purple-100 text-purple-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                    <p className="text-muted-foreground">Manage customer orders and approvals</p>
                </div>
                <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className="capitalize"
                    >
                        {status === 'all' ? 'All Orders' : status}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order List ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No orders found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Tracking ID</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id}</TableCell>
                                        <TableCell>
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {order.tracking_id ? (
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                                        {order.tracking_id}
                                                    </code>
                                                    <button
                                                        onClick={() => copyTrackingId(order.tracking_id)}
                                                        className="p-1 hover:bg-slate-100 rounded"
                                                    >
                                                        <Copy className="w-3 h-3 text-slate-500" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>KES {order.total_amount?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {order.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => approveOrder(order.id)}
                                                        disabled={isApproving === order.id}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        {isApproving === order.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                {order.status !== 'pending' && order.status !== 'Cancelled' && (
                                                    <select
                                                        className="h-8 w-[140px] rounded-md border border-input bg-background px-2 text-xs"
                                                        value={order.status}
                                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    >
                                                        <option value="approved">Approved</option>
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Created: {selectedOrder?.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={getStatusVariant(selectedOrder.status)}>
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="font-bold">KES {selectedOrder.total_amount?.toLocaleString()}</p>
                                </div>
                            </div>
                            {selectedOrder.tracking_id && (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-600 mb-1">Tracking ID</p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-lg font-mono font-bold text-blue-800">
                                            {selectedOrder.tracking_id}
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyTrackingId(selectedOrder.tracking_id)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {selectedOrder.approved_at && (
                                        <p className="text-xs text-blue-500 mt-2">
                                            Approved: {new Date(selectedOrder.approved_at).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminOrders;
