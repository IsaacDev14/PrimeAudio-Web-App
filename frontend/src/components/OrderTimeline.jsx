import { motion } from 'framer-motion';
import { Package, CreditCard, CheckCircle, Truck, Home, XCircle } from 'lucide-react';
import { AppIcon } from './ui/app-icon';

const ORDER_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'payment', label: 'Payment Confirmed', icon: CreditCard },
    { key: 'processing', label: 'Processing', icon: CheckCircle },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home }
];

const getStepIndex = (status) => {
    const statusMap = {
        'pending': 0,
        'confirmed': 1,
        'paid': 1,
        'processing': 2,
        'preparing': 2,
        'shipped': 3,
        'in_transit': 3,
        'out_for_delivery': 3,
        'delivered': 4,
        'completed': 4,
        'cancelled': -1
    };
    return statusMap[status?.toLowerCase()] ?? 0;
};

const OrderTimeline = ({ status, createdAt, updatedAt, className = "" }) => {
    const currentStep = getStepIndex(status);
    const isCancelled = status?.toLowerCase() === 'cancelled';

    if (isCancelled) {
        return (
            <div className={`flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl ${className}`}>
                <AppIcon icon={XCircle} size="lg" className="text-red-600" />
                <div>
                    <p className="font-medium text-red-700 dark:text-red-400">Order Cancelled</p>
                    <p className="text-sm text-red-600/70">This order has been cancelled</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center justify-between mb-6">
                {ORDER_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex flex-col items-center relative">
                            {/* Step Circle */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                    } ${isCurrent ? 'ring-4 ring-green-200 dark:ring-green-900' : ''}`}
                            >
                                <Icon className="w-5 h-5" />

                                {/* Pulse animation for current step */}
                                {isCurrent && (
                                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <span className={`mt-2 text-xs font-medium text-center w-20 ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-slate-400'
                                }`}>
                                {step.label}
                            </span>

                            {/* Connector Line */}
                            {index < ORDER_STEPS.length - 1 && (
                                <div
                                    className="absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5"
                                    style={{ width: '60px', left: '55%' }}
                                >
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: index < currentStep ? 1 : 0 }}
                                        transition={{ delay: index * 0.15, duration: 0.3 }}
                                        className="h-full bg-green-500 origin-left"
                                    />
                                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 -z-10" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Timestamps */}
            {(createdAt || updatedAt) && (
                <div className="flex justify-between text-xs text-slate-500">
                    {createdAt && (
                        <span>Ordered: {new Date(createdAt).toLocaleDateString()}</span>
                    )}
                    {updatedAt && (
                        <span>Updated: {new Date(updatedAt).toLocaleDateString()}</span>
                    )}
                </div>
            )}
        </div>
    );
};

// Compact version for lists
export const OrderTimelineCompact = ({ status }) => {
    const currentStep = getStepIndex(status);
    const isCancelled = status?.toLowerCase() === 'cancelled';

    if (isCancelled) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                <XCircle className="w-3 h-3" />
                Cancelled
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {ORDER_STEPS.map((step, index) => (
                <div
                    key={step.key}
                    className={`w-2 h-2 rounded-full transition-colors ${index <= currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                />
            ))}
            <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">
                {ORDER_STEPS[currentStep]?.label || status}
            </span>
        </div>
    );
};

export default OrderTimeline;
