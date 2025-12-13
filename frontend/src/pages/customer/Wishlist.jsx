import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    ShoppingCart,
    Trash2,
    Package,
    AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CustomerWishlist = () => {
    const { addToCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:8000/wishlist/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setWishlistItems(data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        const token = localStorage.getItem('token');

        try {
            await fetch(`http://localhost:8000/wishlist/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleAddToCart = (item) => {
        addToCart({
            id: item.product_id,
            name: item.product_name,
            price: item.product_price,
            image_url: item.product_image,
            quantity: 1
        });
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear your wishlist?')) return;

        const token = localStorage.getItem('token');

        try {
            await fetch('http://localhost:8000/wishlist/', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setWishlistItems([]);
        } catch (error) {
            console.error('Error clearing wishlist:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="text-gray-500 mt-1">
                        {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
                    </p>
                </div>
                {wishlistItems.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : wishlistItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save products you like to buy them later</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {wishlistItems.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <Link to={`/product/${item.product_id}`} className="block">
                                <div className="aspect-square bg-gray-100 relative">
                                    {item.product_image ? (
                                        <img
                                            src={item.product_image}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    {item.product_stock === 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <div className="p-4">
                                <Link to={`/product/${item.product_id}`}>
                                    <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
                                        {item.product_name}
                                    </h3>
                                </Link>
                                <p className="text-lg font-bold text-blue-600 mt-2">
                                    KSh {item.product_price?.toLocaleString()}
                                </p>

                                {item.product_stock > 0 && item.product_stock < 5 && (
                                    <p className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Only {item.product_stock} left
                                    </p>
                                )}

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={item.product_stock === 0}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => handleRemove(item.product_id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerWishlist;
