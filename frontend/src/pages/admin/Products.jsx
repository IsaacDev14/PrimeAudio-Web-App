import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Loader2, Image as ImageIcon, Briefcase, Calendar, Folder, FileText, Globe } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";

const AdminContent = () => {
    const [contentItems, setContentItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("Projects"); // Projects, Services, Media, Blog

    // Modal Interaction States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Projects",
        type: "",
        status: "Live",
        date: new Date().toISOString().split('T')[0],
        external_link: "",
        order: 1,
        image_url: "",
    });

    useEffect(() => {
        fetchContent();
    }, [activeTab]);

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/content/?category=${activeTab}`);
            if (response.ok) {
                const data = await response.json();
                setContentItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch content:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = { ...formData, category: activeTab }; // Ensure category matches active tab
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

            let response;
            if (currentItem) {
                response = await fetch(`http://localhost:8000/content/${currentItem.id}`, {
                    method: "PUT", headers, body: JSON.stringify(payload)
                });
            } else {
                response = await fetch("http://localhost:8000/content/", {
                    method: "POST", headers, body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                fetchContent();
                setIsDialogOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error("Error saving content:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentItem) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:8000/content/${currentItem.id}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                setContentItems(prev => prev.filter(i => i.id !== currentItem.id));
                setIsDeleteDialogOpen(false);
                setCurrentItem(null);
            }
        } catch (error) { console.error(error); }
    };

    const openEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            title: item.title, description: item.description, category: item.category,
            type: item.type, status: item.status, date: item.date,
            external_link: item.external_link, order: item.order, image_url: item.image_url
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentItem(null);
        setFormData({
            title: "", description: "", category: activeTab, type: "", status: "Live",
            date: new Date().toISOString().split('T')[0], external_link: "", order: 1, image_url: ""
        });
    };

    const getStatusColor = (status) => {
        if (status === "Live") return "bg-green-100 text-green-700 border-green-200";
        if (status === "Beta") return "bg-yellow-100 text-yellow-700 border-yellow-200";
        return "bg-gray-100 text-gray-600 border-gray-200";
    };

    const filteredItems = contentItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Content Manager</h2>
                    <div className="flex bg-gray-100 p-1 rounded-lg mt-4 w-fit border border-gray-200 space-x-1">
                        {["Projects", "Services", "Media", "Blog"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                    ? "bg-white text-gray-900 shadow"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab === "Media" ? "Media & Press" : tab === "Blog" ? "Blog Posts" : tab}
                            </button>
                        ))}
                    </div>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            placeholder={`Search in ${activeTab}...`}
                            className="h-10 w-full rounded-lg bg-gray-50 border border-gray-200 pl-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider font-semibold text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading content...</td></tr>
                            ) : filteredItems.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No items found in {activeTab}.</td></tr>
                            ) : filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-500 font-bold">#{item.id}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-full w-full p-2 text-gray-400" />
                                            )}
                                        </div>
                                        {item.title}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{item.type || item.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-gray-400">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => { setCurrentItem(item); setIsDeleteDialogOpen(true); }} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-400">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Create Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{currentItem ? "Edit Content Item" : "Add New Content"}</DialogTitle>
                        <DialogDescription>
                            {currentItem ? `Edit details for ${currentItem.title}` : `Create a new item in ${activeTab}`}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                name="title" value={formData.title} onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                name="description" value={formData.description} onChange={handleInputChange} rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category / Type</Label>
                                <Input
                                    name="type" value={formData.type} onChange={handleInputChange} placeholder="e.g. HR Tech, Community"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    name="date" type="date" value={formData.date} onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                    name="status" value={formData.status} onChange={handleInputChange}
                                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Live">Live</option>
                                    <option value="Beta">Beta</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Order</Label>
                                <Input
                                    name="order" type="number" value={formData.order} onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>External Link</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    name="external_link" value={formData.external_link} onChange={handleInputChange} placeholder="https://"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                                name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Item
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminContent;
