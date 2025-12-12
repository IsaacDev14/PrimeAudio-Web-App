import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, Music, Speaker, Mic, Guitar, Radio, Filter, X, Loader2, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';

// Category icon mapping
const CATEGORY_ICONS = {
    "Guitars": Guitar,
    "Keyboards": Music,
    "Drums": Music,
    "Microphones": Mic,
    "Speakers": Speaker,
    "DJ Equipment": Radio,
    "Audio Interfaces": Radio,
    "Headphones": Music,
    "Amplifiers": Speaker,
    "Lighting": Speaker,
    "Accessories": Package,
};

const PRICE_RANGES = [
    { label: "Under KES 10,000", min: 0, max: 10000 },
    { label: "KES 10,000 - 50,000", min: 10000, max: 50000 },
    { label: "KES 50,000 - 100,000", min: 50000, max: 100000 },
    { label: "Above KES 100,000", min: 100000, max: null },
];

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState(null);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Fetch products and metadata on mount
    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
    }, [activeCategory, priceRange, selectedBrands]);

    // Handle URL category param
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setActiveCategory(categoryParam);
        } else {
            setActiveCategory(null);
        }
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:8000/products/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const res = await fetch('http://localhost:8000/products/brands');
            if (res.ok) {
                const data = await res.json();
                setBrands(data.slice(0, 15)); // Limit to 15 brands
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            let url = 'http://localhost:8000/products/?limit=100';
            
            if (activeCategory) {
                url += `&category=${encodeURIComponent(activeCategory)}`;
            }
            if (priceRange) {
                url += `&min_price=${priceRange.min}`;
                if (priceRange.max) {
                    url += `&max_price=${priceRange.max}`;
                }
            }
            
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryClick = (categoryName) => {
        if (!categoryName) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('category');
            setSearchParams(newParams);
            setActiveCategory(null);
        } else {
            setSearchParams({ category: categoryName });
            setActiveCategory(categoryName);
        }
    };

    const clearFilters = () => {
        setSearchParams({});
        setActiveCategory(null);
        setPriceRange(null);
        setSelectedBrands([]);
        setInStockOnly(false);
    };

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    // Client-side filtering for search, brands, and stock
    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesStock = !inStockOnly || product.stock > 0;

        return matchesSearch && matchesBrand && matchesStock;
    });

    const Sidebar = () => (
        <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            {/* Categories */}
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Categories</h3>
                <div className="space-y-2">
                    <div
                        onClick={() => handleCategoryClick(null)}
                        className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        All Categories
                    </div>
                    {categories.map(cat => {
                        const Icon = CATEGORY_ICONS[cat.name] || Package;
                        return (
                            <div
                                key={cat.name}
                                onClick={() => handleCategoryClick(cat.name)}
                                className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${activeCategory === cat.name ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {cat.name}
                                </span>
                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{cat.count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Price Filter */}
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Price Range</h3>
                <div className="space-y-2">
                    {PRICE_RANGES.map((range, i) => (
                        <div
                            key={i}
                            onClick={() => setPriceRange(priceRange?.label === range.label ? null : range)}
                            className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-colors ${priceRange?.label === range.label ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}
                        >
                            {range.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Brands Filter */}
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Brands</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map(brand => (
                        <label key={brand.name} className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand.name)}
                                onChange={() => toggleBrand(brand.name)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            {brand.name} ({brand.count})
                        </label>
                    ))}
                </div>
            </div>

            {/* Stock Filter */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                    <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={() => setInStockOnly(!inStockOnly)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    In Stock Only
                </label>
            </div>

            {/* Clear Filters */}
            {(activeCategory || priceRange || selectedBrands.length > 0 || inStockOnly) && (
                <button
                    onClick={clearFilters}
                    className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                >
                    Clear All Filters
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <span>Home</span>
                        <ChevronRight className="w-4 h-4" />
                        <span>Shop</span>
                        {activeCategory && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-slate-900">{activeCategory}</span>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h1 className="text-3xl font-bold text-slate-900">
                            {activeCategory || "All Products"}
                        </h1>
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Pills (Mobile) */}
            <div className="lg:hidden bg-white border-b border-slate-200 py-4 overflow-x-auto">
                <div className="container mx-auto px-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                        >
                            All
                        </button>
                        {categories.slice(0, 6).map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => handleCategoryClick(cat.name)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.name ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden bg-white py-3 px-4 flex items-center justify-between border-b border-slate-200">
                <span className="text-sm text-slate-600">{filteredProducts.length} products found</span>
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setShowMobileFilters(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block">
                        <Sidebar />
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-slate-600 text-sm">
                                Showing <span className="font-medium text-slate-900">{filteredProducts.length}</span> products
                            </p>
                            <select className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>Sort by: Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest First</option>
                            </select>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                                <p className="text-slate-500">Try adjusting your filters or search term.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
