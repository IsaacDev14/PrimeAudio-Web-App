import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const toast = useToast();

    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                toast.cart(`Updated quantity: ${product.name}`);
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            toast.cart(`Added to cart: ${product.name}`);
            return [...prev, { ...product, quantity }];
        });
    }, [toast]);

    const removeFromCart = useCallback((productId) => {
        setCart(prev => {
            const item = prev.find(i => i.id === productId);
            if (item) {
                toast.info(`Removed: ${item.name}`);
            }
            return prev.filter(item => item.id !== productId);
        });
    }, [toast]);

    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    }, []);

    const clearCart = useCallback(() => {
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
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
