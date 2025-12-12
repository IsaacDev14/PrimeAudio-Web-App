import { useState, useEffect } from "react";
import { Search, Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Copy, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";

const AdminMedia = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadType, setUploadType] = useState("file"); // file or url
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadUrl, setUploadUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Mock initial data if backend is empty, but we'll try to fetch
    // Since there isn't a dedicated media table in the simplified schema, 
    // we might just view all product images or uploaded files. 
    // For this task, we'll simulate a media library management or fetch from a new endpoint if we had one.
    // We'll stick to a mock + actual upload functionality for now.

    const handleFileUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", uploadFile);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:8000/products/upload", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                const newItem = {
                    id: Date.now(),
                    name: uploadFile.name,
                    url: data.url,
                    type: "image",
                    date: new Date().toISOString().split('T')[0],
                    size: (uploadFile.size / 1024).toFixed(1) + " KB"
                };
                setMediaItems([newItem, ...mediaItems]);
                setIsUploadOpen(false);
                setUploadFile(null);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlAdd = () => {
        if (!uploadUrl) return;
        const newItem = {
            id: Date.now(),
            name: "External Link",
            url: uploadUrl,
            type: "link",
            date: new Date().toISOString().split('T')[0],
            size: "-"
        };
        setMediaItems([newItem, ...mediaItems]);
        setIsUploadOpen(false);
        setUploadUrl("");
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = (id) => {
        setMediaItems(mediaItems.filter(item => item.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Media Library</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage images and external media links.</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Upload className="mr-2 h-4 w-4" /> Upload Media
                </Button>
            </div>

            <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            placeholder="Search media..."
                            className="h-10 w-full rounded-lg bg-slate-900 border-slate-700 pl-10 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {mediaItems.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No media items found. Upload some!</p>
                        </div>
                    ) : (
                        mediaItems.map((item) => (
                            <div key={item.id} className="group relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden hover:border-slate-600 transition-all">
                                <div className="aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                                    {item.type === "image" || item.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <LinkIcon className="h-8 w-8 text-slate-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => copyToClipboard(item.url, item.id)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors" title="Copy URL">
                                            {copiedId === item.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-red-400 transition-colors" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-slate-200 truncate" title={item.name}>{item.name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-slate-500">{item.size}</span>
                                        <span className="text-xs text-slate-500">{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="bg-[#1e293b] border-slate-700 text-slate-100 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Media</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Upload an image file or add an external link.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="flex items-center gap-4 bg-slate-900 p-1 rounded-lg">
                            <button
                                onClick={() => setUploadType("file")}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadType === "file" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                            >
                                File Upload
                            </button>
                            <button
                                onClick={() => setUploadType("url")}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadType === "url" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                            >
                                External URL
                            </button>
                        </div>

                        {uploadType === "file" ? (
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="file" className="text-slate-300">Image File</Label>
                                <Input
                                    id="file" type="file" accept="image/*"
                                    className="bg-slate-900 border-slate-700 text-slate-300 file:text-blue-400 file:bg-blue-900/20 file:border-0 file:rounded-md"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                />
                            </div>
                        ) : (
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="url" className="text-slate-300">Image URL</Label>
                                <Input
                                    id="url" placeholder="https://example.com/image.jpg"
                                    className="bg-slate-900 border-slate-700 text-slate-300 focus:ring-blue-500"
                                    value={uploadUrl}
                                    onChange={(e) => setUploadUrl(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={uploadType === "file" ? handleFileUpload : handleUrlAdd}
                            disabled={isUploading}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        >
                            {isUploading ? "Uploading..." : "Add to Library"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMedia;
