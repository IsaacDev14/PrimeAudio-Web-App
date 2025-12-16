import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Edit2, Gift, Calendar, Tag, Percent,
    Package, X, Check, Search, ChevronDown
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config/api';

const AdminOffers = () => {
    const toast = useToast();
    const [offers, setOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, offerId: null, offerTitle: '' });
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [expandedOfferId, setExpandedOfferId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percentage: 10,
        banner_color: '#EF4444',
        badge_text: 'SALE',
        start_date: '',
        end_date: '',
        is_active: true,
        product_ids: []
    });

    const colorOptions = [
        { name: 'Red', value: '#EF4444' },
        { name: 'Green', value: '#22C55E' },
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Purple', value: '#8B5CF6' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Pink', value: '#EC4899' },
    ];

    useEffect(() => {
        fetchOffers();
        fetchProducts();
    }, []);

    const fetchOffers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/offers/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOffers(data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products/`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        console.log('Submitting offer with data:', formData);

        try {
            const url = editingOffer
                ? `${API_URL}/offers/${editingOffer.id}`
                : `${API_URL}/offers/`;

            const method = editingOffer ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString()
            };

            console.log('Sending payload:', payload);
            console.log('Using token:', token ? 'Present' : 'MISSING');

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                toast.success(editingOffer ? 'Offer updated!' : 'Offer created!');
                setShowModal(false);
                resetForm();
                fetchOffers();
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                toast.error(errorData.detail || 'Failed to save offer');
            }
        } catch (err) {
            console.error('Network/JS error:', err);
            toast.error('Error saving offer: ' + err.message);
        }
    };

    const handleDelete = async (offerId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/offers/${offerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Offer deleted successfully');
                fetchOffers();
            } else {
                const errorData = await response.json();
                toast.error(errorData.detail || 'Failed to delete offer');
            }
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Error deleting offer');
        } finally {
            setDeleteConfirm({ show: false, offerId: null, offerTitle: '' });
        }
    };

    const handleClearAll = async () => {
        const token = localStorage.getItem('token');

        try {
            // Delete all offers one by one
            for (const offer of offers) {
                await fetch(`${API_URL}/offers/${offer.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            toast.success('All offers cleared');
            fetchOffers();
        } catch (err) {
            console.error('Clear all error:', err);
            toast.error('Error clearing offers');
        } finally {
            setShowClearAllConfirm(false);
        }
    };

    const toggleProduct = (productId) => {
        setFormData(prev => ({
            ...prev,
            product_ids: prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId]
        }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            discount_percentage: 10,
            banner_color: '#EF4444',
            badge_text: 'SALE',
            start_date: '',
            end_date: '',
            is_active: true,
            product_ids: []
        });
        setEditingOffer(null);
    };

    const openEditModal = (offer) => {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description || '',
            discount_percentage: offer.discount_percentage,
            banner_color: offer.banner_color,
            badge_text: offer.badge_text,
            start_date: offer.start_date.slice(0, 16),
            end_date: offer.end_date.slice(0, 16),
            is_active: offer.is_active,
            product_ids: offer.products?.map(p => p.product_id) || []
        });
        setShowModal(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isOfferActive = (offer) => {
        const now = new Date();
        return offer.is_active &&
            new Date(offer.start_date) <= now &&
            new Date(offer.end_date) >= now;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prime-blue"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900">Promotional Offers</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage sales & discounts</p>
                </div>
                <div className="flex gap-2">
                    {offers.length > 0 && (
                        <button
                            onClick={() => setShowClearAllConfirm(true)}
                            className="flex items-center gap-1 md:gap-2 bg-red-100 text-red-600 px-3 md:px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>
                    )}
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-1 md:gap-2 bg-prime-blue text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                        <Plus size={18} />
                        <span>New Offer</span>
                    </button>
                </div>
            </div>

            {/* Offers Grid */}
            {offers.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
                    <p className="text-gray-500 mb-4">Create your first promotional offer</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-prime-blue hover:underline font-medium"
                    >
                        Create Offer →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Banner Preview */}
                            <div
                                className="p-4 text-white"
                                style={{ backgroundColor: offer.banner_color }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
                                            {offer.badge_text}
                                        </span>
                                        <h3 className="font-bold text-lg mt-2">{offer.title}</h3>
                                    </div>
                                    <span className="text-3xl font-bold">
                                        {offer.discount_percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-4">
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {offer.description || 'No description'}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                    <Calendar size={14} />
                                    <span>
                                        {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Clickable Products Section */}
                                <div className="mb-3">
                                    <button
                                        onClick={() => setExpandedOfferId(expandedOfferId === offer.id ? null : offer.id)}
                                        className="flex items-center gap-2 text-xs w-full py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Package size={14} className="text-gray-400" />
                                        <span className="text-gray-600 font-medium">
                                            {offer.products?.length || 0} products
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`text-gray-400 transition-transform ${expandedOfferId === offer.id ? 'rotate-180' : ''}`}
                                        />
                                        {isOfferActive(offer) ? (
                                            <span className="ml-auto bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                                Inactive
                                            </span>
                                        )}
                                    </button>

                                    {/* Expanded Products List */}
                                    <AnimatePresence>
                                        {expandedOfferId === offer.id && offer.products?.length > 0 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-2 bg-gray-50 rounded-lg p-2 space-y-2 max-h-40 overflow-y-auto">
                                                    {offer.products.map(product => (
                                                        <div
                                                            key={product.id}
                                                            className="flex items-center gap-2 bg-white rounded-lg p-2"
                                                        >
                                                            <img
                                                                src={product.product_image || '/placeholder.jpg'}
                                                                alt={product.product_name}
                                                                className="w-10 h-10 object-cover rounded-lg"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {product.product_name}
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                    {product.product_price ? (
                                                                        <>
                                                                            <span className="text-xs text-red-600 font-bold">
                                                                                KSh {(product.product_price * (1 - offer.discount_percentage / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400 line-through">
                                                                                KSh {product.product_price?.toLocaleString()}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-500">Price not set</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openEditModal(offer)}
                                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm({ show: true, offerId: offer.id, offerTitle: offer.title })}
                                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Title & Badge */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Christmas Sale 🎄"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prime-blue focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                                        <input
                                            type="text"
                                            value={formData.badge_text}
                                            onChange={e => setFormData({ ...formData, badge_text: e.target.value })}
                                            placeholder="SALE"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prime-blue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Up to 50% off on select items!"
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prime-blue focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Discount & Color */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Discount Percentage *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.discount_percentage}
                                                onChange={e => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                                                min="1"
                                                max="99"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prime-blue focus:border-transparent"
                                                required
                                            />
                                            <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Color</label>
                                        <div className="flex gap-2">
                                            {colorOptions.map(color => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, banner_color: color.value })}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.banner_color === color.value
                                                        ? 'border-gray-900 scale-110'
                                                        : 'border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: color.value }}
                                                    title={color.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.start_date}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prime-blue focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.end_date}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-prime-blue focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_active ? 'left-7' : 'left-1'
                                            }`} />
                                    </button>
                                    <span className="text-sm text-gray-700">Offer is active</span>
                                </div>

                                {/* Product Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Apply to Products ({formData.product_ids.length} selected)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowProductSelector(!showProductSelector)}
                                        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <span className="text-gray-600">
                                            {formData.product_ids.length > 0
                                                ? `${formData.product_ids.length} products selected`
                                                : 'Select products...'}
                                        </span>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProductSelector ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showProductSelector && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-2 border border-gray-200 rounded-lg">
                                                    <div className="p-2 border-b border-gray-100">
                                                        <div className="relative">
                                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={searchTerm}
                                                                onChange={e => setSearchTerm(e.target.value)}
                                                                placeholder="Search products..."
                                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-48 overflow-y-auto">
                                                        {filteredProducts.map(product => (
                                                            <label
                                                                key={product.id}
                                                                className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.product_ids.includes(product.id)}
                                                                    onChange={() => toggleProduct(product.id)}
                                                                    className="w-4 h-4 text-prime-blue rounded"
                                                                />
                                                                <img
                                                                    src={product.image_url || '/placeholder.jpg'}
                                                                    alt={product.name}
                                                                    className="w-8 h-8 object-cover rounded"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                                    <p className="text-xs text-gray-500">KSh {product.price?.toLocaleString()}</p>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-prime-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        {editingOffer ? 'Update Offer' : 'Create Offer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteConfirm({ show: false, offerId: null, offerTitle: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <Trash2 className="w-7 h-7 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Offer?</h3>
                                <p className="text-gray-500 mb-6">
                                    Are you sure you want to delete "<span className="font-semibold text-gray-700">{deleteConfirm.offerTitle}</span>"?
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm({ show: false, offerId: null, offerTitle: '' })}
                                        className="flex-1 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm.offerId)}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clear All Confirmation Modal */}
            <AnimatePresence>
                {showClearAllConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowClearAllConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <Trash2 className="w-7 h-7 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Clear All Offers?</h3>
                                <p className="text-gray-500 mb-2">
                                    This will permanently delete <span className="font-bold text-red-600">{offers.length}</span> offer{offers.length !== 1 ? 's' : ''}.
                                </p>
                                <p className="text-sm text-red-500 mb-6 font-medium">
                                    ⚠️ This action cannot be undone!
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowClearAllConfirm(false)}
                                        className="flex-1 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOffers;
