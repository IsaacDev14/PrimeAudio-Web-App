import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Loader2, Image as ImageIcon, X, Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = [
    "Guitars", "Keyboards", "Drums", "Microphones", "Speakers",
    "DJ Equipment", "Audio Interfaces", "Headphones", "Amplifiers", "Accessories"
];

const CONDITIONS = ["New", "Used - Like New", "Used - Excellent", "Used - Good"];

const AdminProducts = () => {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Modal states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Guitars",
        brand: "",
        condition: "New",
        stock: 0,
        image_url: "",
        images: [],
        is_featured: false
    });

    // New image URL input
    const [newImageUrl, setNewImageUrl] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8000/products/?limit=500");
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addImageUrl = () => {
        if (newImageUrl.trim() && !formData.images.includes(newImageUrl)) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, newImageUrl.trim()]
            }));
            setNewImageUrl("");
        }
    };

    const removeImageUrl = (urlToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(url => url !== urlToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            };

            let response;
            if (currentProduct) {
                response = await fetch(`http://localhost:8000/products/${currentProduct.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch("http://localhost:8000/products/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                fetchProducts();
                setIsDialogOpen(false);
                resetForm();
                toast.success(currentProduct ? 'Product updated successfully' : 'Product created successfully');
            } else {
                const error = await response.json();
                toast.error(error.detail || 'Failed to save product');
            }
        } catch (error) {
            console.error("Error saving product:", error);
            toast.error('An error occurred while saving');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!currentProduct) return;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:8000/products/${currentProduct.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== currentProduct.id));
                setIsDeleteDialogOpen(false);
                setCurrentProduct(null);
                toast.success('Product deleted successfully');
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error('An error occurred while deleting');
        }
    };

    const openEdit = (product) => {
        setCurrentProduct(product);
        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price?.toString() || "",
            category: product.category || "Guitars",
            brand: product.brand || "",
            condition: product.condition || "New",
            stock: product.stock || 0,
            image_url: product.image_url || "",
            images: product.images || [],
            is_featured: product.is_featured || false
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            category: "Guitars",
            brand: "",
            condition: "New",
            stock: 0,
            image_url: "",
            images: [],
            is_featured: false
        });
        setNewImageUrl("");
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">Manage your shop inventory ({products.length} items)</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Products Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Product List ({filteredProducts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No products found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.slice(0, 50).map((product) => (
                                <div key={product.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                                    <div className="aspect-square bg-slate-100 relative">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        {product.is_featured && (
                                            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                                Featured
                                            </span>
                                        )}
                                        {product.images?.length > 0 && (
                                            <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                                +{product.images.length} images
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-primary">KES {product.price?.toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(product)}>
                                                <Pencil className="w-3 h-3 mr-1" /> Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => { setCurrentProduct(product); setIsDeleteDialogOpen(true); }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {filteredProducts.length > 50 && (
                        <p className="text-center text-muted-foreground mt-4">
                            Showing 50 of {filteredProducts.length} products. Use search to find specific items.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Product Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{currentProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {currentProduct ? `Editing ${currentProduct.name}` : "Fill in the product details"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Product Name *</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <Input
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Price (KES) *</Label>
                                <Input
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Condition</Label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    {CONDITIONS.map(cond => (
                                        <option key={cond} value={cond}>{cond}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleInputChange}
                                    className="w-4 h-4"
                                />
                                <Label>Featured Product</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Primary Image URL</Label>
                            <Input
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Multiple Images */}
                        <div className="space-y-2">
                            <Label>Additional Images</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="Paste image URL and click Add"
                                    className="flex-1"
                                />
                                <Button type="button" variant="outline" onClick={addImageUrl}>
                                    Add
                                </Button>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Additional ${index + 1}`}
                                                className="w-16 h-16 object-cover rounded border"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/64?text=Error'}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImageUrl(url)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentProduct ? "Save Changes" : "Add Product"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{currentProduct?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminProducts;
