import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Loader2, RefreshCcw, Activity } from "lucide-react";
import { Button } from "../../components/ui/button";
import { API_URL } from "../../config/api";

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        date: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        // Client-side filtering
        let result = logs;

        if (filters.user) {
            result = result.filter(log =>
                log.performed_by?.toLowerCase().includes(filters.user.toLowerCase()) ||
                log.details?.toLowerCase().includes(filters.user.toLowerCase())
            );
        }

        if (filters.action) {
            result = result.filter(log =>
                log.action?.toLowerCase().includes(filters.action.toLowerCase())
            );
        }

        if (filters.date) {
            // Check if log date matches selected date
            result = result.filter(log => {
                const logDate = new Date(log.created_at).toISOString().split('T')[0];
                return logDate === filters.date;
            });
        }

        setFilteredLogs(result);
    }, [filters, logs]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/activity-logs/?limit=100`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
                setFilteredLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch activity logs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
                    <p className="text-muted-foreground">Monitor system access and actions</p>
                </div>
                <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search User</label>
                            <input
                                type="text"
                                placeholder="Admin Name or User ID"
                                value={filters.user}
                                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                                className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Action Type</label>
                            <select
                                value={filters.action}
                                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                                className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value="">All Actions</option>
                                <option value="LOGIN">Login</option>
                                <option value="ORDER_UPDATE">Order Update</option>
                                <option value="PRODUCT_UPDATE">Product Update</option>
                                <option value="DELETE_ORDER">Delete Order</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        System Events ({filteredLogs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No matching records found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Performed By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${log.action?.includes('DELETE') ? 'bg-red-100 text-red-700' :
                                                    log.action?.includes('LOGIN') ? 'bg-green-100 text-green-700' :
                                                        'bg-blue-50 text-blue-700'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                {log.entity_type} #{log.entity_id?.slice(0, 8)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{log.details}</TableCell>
                                        <TableCell className="text-sm font-medium">{log.performed_by}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityLog;
