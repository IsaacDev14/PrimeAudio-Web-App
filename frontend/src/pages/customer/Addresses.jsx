import { useState, useEffect } from 'react';
import {
    MapPin,
    Plus,
    Edit2,
    Trash2,
    Star,
    Home,
    Briefcase,
    X,
    Loader2,
    CheckCircle
} from 'lucide-react';
import { API_URL } from '../../config/api';
import { AppIcon } from '../../components/ui/app-icon';

const CustomerAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        label: 'Home',
        full_name: '',
        phone: '',
        address_line: '',
        city: 'Nairobi',
        county: '',
        is_default: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/addresses/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setAddresses(data);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const token = localStorage.getItem('token');
        const url = editingAddress
            ? `${API_URL}/addresses/${editingAddress.id}`
            : `${API_URL}/addresses/`;
        const method = editingAddress ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchAddresses();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        const token = localStorage.getItem('token');

        try {
            await fetch(`${API_URL}/addresses/${addressId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const handleSetDefault = async (addressId) => {
        const token = localStorage.getItem('token');

        try {
            await fetch(`${API_URL}/addresses/${addressId}/set-default`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default:', error);
        }
    };

    const openEdit = (address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label,
            full_name: address.full_name,
            phone: address.phone,
            address_line: address.address_line,
            city: address.city,
            county: address.county || '',
            is_default: address.is_default
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingAddress(null);
        setFormData({
            label: 'Home',
            full_name: '',
            phone: '',
            address_line: '',
            city: 'Nairobi',
            county: '',
            is_default: false
        });
    };

    const getLabelIcon = (label) => {
        if (label?.toLowerCase().includes('home')) return Home;
        if (label?.toLowerCase().includes('office') || label?.toLowerCase().includes('work')) return Briefcase;
        return MapPin;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
                    <p className="text-gray-500 mt-1">Manage your delivery addresses</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Address
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : addresses.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-gray-500 mb-4">Add a delivery address for faster checkout</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add your first address
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((address) => {
                        const LabelIcon = getLabelIcon(address.label);
                        return (
                            <div
                                key={address.id}
                                className={`bg-white rounded-xl border-2 p-5 relative ${address.is_default ? 'border-blue-500' : 'border-gray-200'
                                    }`}
                            >
                                {address.is_default && (
                                    <span className="absolute top-3 right-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Default
                                    </span>
                                )}

                                <div className="flex items-start gap-3">
                                    <AppIcon icon={LabelIcon} className="mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{address.label}</h3>
                                        <p className="text-gray-700 mt-1">{address.full_name}</p>
                                        <p className="text-gray-500 text-sm mt-1">{address.phone}</p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            {address.address_line}
                                            <br />
                                            {address.city}{address.county ? `, ${address.county}` : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => openEdit(address)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    {!address.is_default && (
                                        <>
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Star className="w-4 h-4" /> Set Default
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h3>
                            <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Label
                                </label>
                                <select
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Home">Home</option>
                                    <option value="Office">Office</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+254 700 000 000"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.address_line}
                                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                                    placeholder="Street address, building, floor..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        County
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.county}
                                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm text-gray-700">Set as default address</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    {editingAddress ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerAddresses;
