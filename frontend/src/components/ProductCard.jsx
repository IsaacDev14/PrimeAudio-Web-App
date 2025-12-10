import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <motion.div
            className="bg-dark-card rounded-xl overflow-hidden border border-white/5 group hover:border-prime-blue/50 transition-colors"
            whileHover={{ y: -5 }}
        >
            <div className="relative h-64 overflow-hidden">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Link to={`/shop/${product.id}`} className="p-3 bg-white text-dark-bg rounded-full hover:bg-prime-blue hover:text-white transition-colors">
                        <Eye size={20} />
                    </Link>
                    <button className="p-3 bg-prime-red text-white rounded-full hover:bg-red-600 transition-colors">
                        <ShoppingCart size={20} />
                    </button>
                </div>
                {product.stock < 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Low Stock
                    </span>
                )}
                {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                    </span>
                )}
            </div>

            <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">{product.category}</p>
                <Link to={`/shop/${product.id}`}>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-prime-blue transition-colors line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-prime-blue">KSh {product.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                        {/* Placeholder stars */}
                        {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-1 h-1 rounded-full bg-gray-600" />)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
