import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';

// Dummy data for now - will be replaced by API
const DUMMY_PRODUCTS = [
    { id: 1, name: "Yamaha PSR-E473 Keyboard", price: 55000, category: "Keyboards", image_url: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2052&auto=format&fit=crop", stock: 10 },
    { id: 2, name: "Fender Stratocaster", price: 120000, category: "Guitars", image_url: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=1974&auto=format&fit=crop", stock: 3 },
    { id: 3, name: "Shure SM7B Microphone", price: 65000, category: "Microphones", image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1974&auto=format&fit=crop", stock: 15 },
    { id: 4, name: "JBL EON615 Speaker", price: 85000, category: "Speakers", image_url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto=format&fit=crop", stock: 8 },
    { id: 5, name: "Pearl Export Drum Kit", price: 95000, category: "Drums", image_url: "https://images.unsplash.com/photo-1519892300165-cb5542fb6747?q=80&w=2070&auto=format&fit=crop", stock: 2 },
    { id: 6, name: "Focusrite Scarlett 2i2", price: 28000, category: "Audio Interfaces", image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop", stock: 20 },
];

const Shop = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Keyboards", "Guitars", "Microphones", "Speakers", "Drums", "Audio Interfaces"];

    const filteredProducts = DUMMY_PRODUCTS.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="pt-24 pb-20 container mx-auto px-4">
            {/* Header & Filters */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-8">Shop Instruments</h1>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-card p-4 rounded-xl border border-white/5">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search instruments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-prime-blue transition-colors"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-prime-blue text-white' : 'bg-white/5 hover:bg-white/10'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-400">No products found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default Shop;
