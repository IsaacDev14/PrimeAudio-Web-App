import { useState, useEffect } from 'react';
import { User, Mail, Phone, Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CustomerProfile = () => {
    const { user, setUser } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:8000/auth/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.detail || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account information</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Avatar Section */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                {formData.full_name?.charAt(0) || formData.email?.charAt(0) || 'U'}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50">
                                <Camera className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-semibold">{formData.full_name || 'Customer'}</h2>
                            <p className="text-blue-100">{formData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {message.text && (
                        <div className={`p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Enter your full name"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+254 700 000 000"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Change Password
                </button>
            </div>
        </div>
    );
};

export default CustomerProfile;
