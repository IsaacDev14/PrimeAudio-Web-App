import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

// Dummy data needs to match Shop
const DUMMY_PRODUCTS = [
    { id: 1, name: "Yamaha PSR-E473 Keyboard", price: 55000, category: "Keyboards", description: "The PSR-E473 sounds like a pro due to a completely revamped tone generator.", image_url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2052&auto=format&fit=crop", stock: 10 },
    { id: 2, name: "Fender Stratocaster", price: 120000, category: "Guitars", description: "The iconic Stratocaster sound is one of the foundations of the Fender guitar tone.", image_url: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=1974&auto=format&fit=crop", stock: 3 },
    { id: 3, name: "Shure SM7B Microphone", price: 65000, category: "Microphones", description: "The SM7B dynamic microphone has a smooth, flat, wide-range frequency response appropriate for music and speech in all professional audio applications.", image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1974&auto=format&fit=crop", stock: 15 },
    { id: 4, name: "JBL EON615 Speaker", price: 85000, category: "Speakers", description: "More than just another great JBL sound system, the EON615 is a true step forward in technology.", image_url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop", stock: 8 },
    { id: 5, name: "Pearl Export Drum Kit", price: 95000, category: "Drums", description: "The kit that spawned a thousand drumming legends.", image_url: "https://images.unsplash.com/photo-1519892300165-cb5542fb6747?q=80&w=2070&auto=format&fit=crop", stock: 2 },
    { id: 6, name: "Focusrite Scarlett 2i2", price: 28000, category: "Audio Interfaces", description: "The most popular audio interface for artists across all genres.", image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop", stock: 20 },
];

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const product = DUMMY_PRODUCTS.find(p => p.id === parseInt(id));

    if (!product) {
        return <div className="text-center py-20">Product not found</div>;
    }

    const handleAddToCart = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="pt-24 pb-20 container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl overflow-hidden h-[500px] border border-white/5"
                >
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </motion.div>

                {/* Info */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col justify-center"
                >
                    <span className="text-prime-blue font-medium mb-2">{product.category}</span>
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-6">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} fill="currentColor" />)}
                        </div>
                        <span className="text-gray-400">(24 reviews)</span>
                    </div>

                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="text-3xl font-bold text-prime-blue mb-8">
                        KSh {product.price.toLocaleString()}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 ${added ? 'bg-green-600 text-white' : 'btn-primary'}`}
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
                    <div className="mt-4 text-sm text-gray-400">
                        {product.stock > 0 ? (
                            <span className="text-green-500 font-medium">In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="text-red-500 font-medium">Out of Stock</span>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProductDetails;
