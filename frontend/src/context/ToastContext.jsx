import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X, ShoppingCart, Loader2 } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const TOAST_ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    cart: ShoppingCart,
    loading: Loader2,
};

const TOAST_STYLES = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-600 text-white',
    cart: 'bg-slate-900 text-white',
    loading: 'bg-slate-800 text-white',
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration || 5000),
        warning: (message, duration) => addToast(message, 'warning', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        cart: (message, duration) => addToast(message, 'cart', duration || 2500),
        loading: (message) => addToast(message, 'loading', 0), // No auto-dismiss
        dismiss: removeToast,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const Toast = ({ toast, onDismiss }) => {
    const Icon = TOAST_ICONS[toast.type] || Info;
    const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`${style} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px]`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${toast.type === 'loading' ? 'animate-spin' : ''}`} />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            {toast.type !== 'loading' && (
                <button
                    onClick={onDismiss}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
};

export default ToastProvider;
