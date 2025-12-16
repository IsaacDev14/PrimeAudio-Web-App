import { useState, useEffect } from "react";
import { Search, Upload, Image as ImageIcon, Link as LinkIcon, Trash2, Copy, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { API_URL } from "../../config/api";

const AdminMedia = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadType, setUploadType] = useState("file");
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadUrl, setUploadUrl] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const handleFileUpload = async () => {
        if (!uploadFile) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", uploadFile);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/products/upload`, {
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
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Media Library</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage images and external media links.</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Upload className="mr-2 h-4 w-4" /> Upload Media
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            placeholder="Search media..."
                            className="h-10 w-full rounded-lg bg-gray-50 border border-gray-200 pl-10 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {mediaItems.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-40" />
                            <p>No media items found. Upload some!</p>
                        </div>
                    ) : (
                        mediaItems.map((item) => (
                            <div key={item.id} className="group relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition-all">
                                <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                    {item.type === "image" || item.url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <LinkIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => copyToClipboard(item.url, item.id)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-colors" title="Copy URL">
                                            {copiedId === item.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/30 rounded-full hover:bg-red-500/50 text-white transition-colors" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={item.name}>{item.name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-500">{item.size}</span>
                                        <span className="text-xs text-gray-500">{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Media</DialogTitle>
                        <DialogDescription>
                            Upload an image file or add an external link.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setUploadType("file")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${uploadType === "file" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                File Upload
                            </button>
                            <button
                                onClick={() => setUploadType("url")}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${uploadType === "url" ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                External URL
                            </button>
                        </div>

                        {uploadType === "file" ? (
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="file">Image File</Label>
                                <Input
                                    id="file" type="file" accept="image/*"
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                />
                            </div>
                        ) : (
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="url">Image URL</Label>
                                <Input
                                    id="url" placeholder="https://example.com/image.jpg"
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
