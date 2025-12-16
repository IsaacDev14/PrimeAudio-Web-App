/**
 * API Configuration
 * Uses environment variable for easy switching between development and production
 */

// Get API URL from environment variable with fallback to localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to build API endpoints
export const api = {
    // Base URL
    baseUrl: API_URL,

    // Auth endpoints
    auth: {
        login: `${API_URL}/auth/login`,
        register: `${API_URL}/auth/register`,
        me: `${API_URL}/auth/me`,
        users: `${API_URL}/auth/users`,
    },

    // Products endpoints
    products: {
        list: `${API_URL}/products/`,
        detail: (id) => `${API_URL}/products/${id}`,
        categories: `${API_URL}/products/categories`,
        brands: `${API_URL}/products/brands`,
    },

    // Cart endpoints
    cart: {
        list: `${API_URL}/cart/`,
        add: `${API_URL}/cart/add`,
        sync: `${API_URL}/cart/sync`,
        remove: (id) => `${API_URL}/cart/${id}`,
    },

    // Wishlist endpoints
    wishlist: {
        list: `${API_URL}/wishlist/`,
        add: (productId) => `${API_URL}/wishlist/${productId}`,
        remove: (productId) => `${API_URL}/wishlist/${productId}`,
        check: (productId) => `${API_URL}/wishlist/check/${productId}`,
    },

    // Orders endpoints
    orders: {
        list: `${API_URL}/orders/`,
        user: `${API_URL}/orders/user`,
        detail: (id) => `${API_URL}/orders/${id}`,
        create: `${API_URL}/orders/`,
        stats: `${API_URL}/orders/stats`,
    },

    // Messages endpoints
    messages: {
        conversations: `${API_URL}/messages/conversations`,
        messages: (convId) => `${API_URL}/messages/conversations/${convId}/messages`,
    },

    // Offers endpoints
    offers: {
        list: `${API_URL}/offers/`,
        active: `${API_URL}/offers/active`,
        onSale: `${API_URL}/offers/products-on-sale`,
    },

    // Other endpoints
    reviews: (productId) => `${API_URL}/reviews/${productId}`,
    addresses: `${API_URL}/addresses/`,
    notifications: `${API_URL}/notifications/`,
    settings: `${API_URL}/settings/`,
    content: `${API_URL}/content/`,
};

export default api;
