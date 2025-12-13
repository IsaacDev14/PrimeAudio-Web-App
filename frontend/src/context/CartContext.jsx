import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API_URL = 'http://localhost:8000';

export const CartProvider = ({ children }) => {
    const toast = useToast();
    const { user } = useAuth();

    // Use ref to store pending toast messages to show after render
    const pendingToast = useRef(null);
    const syncedRef = useRef(false);

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Always save to localStorage as backup
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Show pending toast after render
    useEffect(() => {
        if (pendingToast.current) {
            const { type, message } = pendingToast.current;
            if (type === 'cart') {
                toast.cart(message);
            } else if (type === 'info') {
                toast.info(message);
            }
            pendingToast.current = null;
        }
    });

    // Fetch cart from backend when user logs in
    useEffect(() => {
        if (user && !syncedRef.current) {
            syncCartWithBackend();
            syncedRef.current = true;
        } else if (!user) {
            syncedRef.current = false;
        }
    }, [user]);

    // Sync local cart with backend on login
    const syncCartWithBackend = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setIsLoading(true);
        try {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');

            // If we have local items, sync them to backend
            if (localCart.length > 0) {
                const res = await fetch(`${API_URL}/cart/sync`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(localCart)
                });

                if (res.ok) {
                    const backendCart = await res.json();
                    setCart(backendCart.map(item => ({
                        id: item.product_id,
                        cartItemId: item.id,
                        name: item.product?.name,
                        price: item.product?.price,
                        image_url: item.product?.image_url,
                        quantity: item.quantity,
                        stock: item.product?.stock
                    })));
                    return;
                }
            }

            // Otherwise just fetch backend cart
            const res = await fetch(`${API_URL}/cart/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const backendCart = await res.json();
                if (backendCart.length > 0) {
                    setCart(backendCart.map(item => ({
                        id: item.product_id,
                        cartItemId: item.id,
                        name: item.product?.name,
                        price: item.product?.price,
                        image_url: item.product?.image_url,
                        quantity: item.quantity,
                        stock: item.product?.stock
                    })));
                }
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = useCallback(async (product, quantity = 1) => {
        const token = localStorage.getItem('token');

        // If logged in, add to backend
        if (token) {
            try {
                const res = await fetch(`${API_URL}/cart/?product_id=${product.id}&quantity=${quantity}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const result = await res.json();
                    setCart(prev => {
                        const existing = prev.find(item => item.id === product.id);
                        if (existing) {
                            pendingToast.current = { type: 'cart', message: `Updated quantity: ${product.name}` };
                            return prev.map(item =>
                                item.id === product.id
                                    ? { ...item, quantity: result.quantity, cartItemId: result.item_id }
                                    : item
                            );
                        }
                        pendingToast.current = { type: 'cart', message: `Added to cart: ${product.name}` };
                        return [...prev, { ...product, quantity: result.quantity, cartItemId: result.item_id }];
                    });
                    return;
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        }

        // Fallback to local storage for guests
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                pendingToast.current = { type: 'cart', message: `Updated quantity: ${product.name}` };
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            pendingToast.current = { type: 'cart', message: `Added to cart: ${product.name}` };
            return [...prev, { ...product, quantity }];
        });
    }, []);

    const removeFromCart = useCallback(async (productId) => {
        const token = localStorage.getItem('token');
        const item = cart.find(i => i.id === productId);

        if (token && item?.cartItemId) {
            try {
                await fetch(`${API_URL}/cart/${item.cartItemId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error removing from cart:', error);
            }
        }

        setCart(prev => {
            if (item) {
                pendingToast.current = { type: 'info', message: `Removed: ${item.name}` };
            }
            return prev.filter(item => item.id !== productId);
        });
    }, [cart]);

    const updateQuantity = useCallback(async (productId, quantity) => {
        if (quantity < 1) return;

        const token = localStorage.getItem('token');
        const item = cart.find(i => i.id === productId);

        if (token && item?.cartItemId) {
            try {
                await fetch(`${API_URL}/cart/${item.cartItemId}?quantity=${quantity}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error updating cart:', error);
            }
        }

        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    }, [cart]);

    const clearCart = useCallback(async () => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                await fetch(`${API_URL}/cart/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        }

        setCart([]);
        toast.info('Cart cleared');
    }, [toast]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount,
            isLoading,
            syncCartWithBackend
        }}>
            {children}
        </CartContext.Provider>
    );
};
