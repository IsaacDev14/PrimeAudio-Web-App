import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Star, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const toast = useToast();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
            } else {
                toast.error('Product not found');
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Failed to load product');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCartClick = () => {
        setShowConfirmDialog(true);
    };

    const confirmAddToCart = () => {
        addToCart(product, quantity);
        setShowConfirmDialog(false);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    // Get images array
    const images = product?.images?.length > 0 ? product.images : [product?.image_url].filter(Boolean);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (isLoading) {
        return (
            <div className="pt-24 pb-20 flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pt-24 pb-20 text-center bg-gray-50 min-h-screen">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
                <Link to="/shop" className="text-blue-600 hover:underline flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <Link to="/shop" className="text-blue-600 hover:underline flex items-center gap-2 mb-8">
                    <ArrowLeft className="w-4 h-4" /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="relative rounded-2xl overflow-hidden h-[500px] bg-white border border-gray-200 shadow-sm">
                            <img
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-700" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                                            }`}
                                    >
                                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600 font-medium">{product.category}</span>
                            {product.brand && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-gray-600">{product.brand}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="currentColor" />)}
                            </div>
                            <span className="text-gray-500">(24 reviews)</span>
                        </div>

                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            {product.description || "Professional audio equipment for musicians and producers."}
                        </p>

                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl font-bold text-gray-900">
                                KSh {product.price?.toLocaleString()}
                            </span>
                            <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">
                                {product.condition || 'New'}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-gray-600 font-medium">Quantity:</span>
                            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center font-medium text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded text-gray-600"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCartClick}
                                disabled={product.stock === 0}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 ${added
                                        ? 'bg-green-600 text-white'
                                        : product.stock === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {added ? (
                                    <>
                                        <Check size={24} /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={24} /> Add to Cart
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-4 text-sm">
                            {product.stock > 0 ? (
                                <span className="text-green-600 font-medium">✓ In Stock ({product.stock} available)</span>
                            ) : (
                                <span className="text-red-500 font-medium">✕ Out of Stock</span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Add to Cart Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add to Cart</DialogTitle>
                        <DialogDescription>
                            Confirm adding this item to your shopping cart
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-4 py-4">
                        <img
                            src={product?.image_url || images[0]}
                            alt={product?.name}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{product?.name}</h4>
                            <p className="text-sm text-gray-500">{product?.category}</p>
                            <p className="font-bold text-blue-600 mt-1">
                                KSh {product?.price?.toLocaleString()} × {quantity} = KSh {(product?.price * quantity).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAddToCart} className="bg-blue-600 hover:bg-blue-700">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Confirm Add to Cart
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductDetails;
