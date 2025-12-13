import { motion } from 'framer-motion';

// Skeleton shimmer animation
const shimmer = {
    hidden: { opacity: 0.5 },
    visible: {
        opacity: 1,
        transition: {
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.8
        }
    }
};

// Base skeleton component
export const Skeleton = ({ className = "", rounded = "rounded" }) => (
    <motion.div
        className={`bg-gray-200 ${rounded} ${className}`}
        variants={shimmer}
        initial="hidden"
        animate="visible"
    />
);

// Product card skeleton
export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <Skeleton className="h-48 w-full" rounded="rounded-none" />
        <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-8" rounded="rounded-full" />
            </div>
        </div>
    </div>
);

// Product grid skeleton (for shop page)
export const ProductGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
);

// Stats card skeleton (for dashboard)
export const StatsCardSkeleton = () => (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
    </div>
);

// Stats grid skeleton
export const StatsGridSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <StatsCardSkeleton key={i} />
        ))}
    </div>
);

// Order row skeleton
export const OrderRowSkeleton = () => (
    <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12" rounded="rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
        <Skeleton className="h-6 w-20" rounded="rounded-full" />
    </div>
);

// Order list skeleton
export const OrderListSkeleton = ({ count = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <OrderRowSkeleton key={i} />
        ))}
    </div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }) => (
    <tr className="border-b border-gray-100">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="py-4 px-4">
                <Skeleton className="h-4 w-full max-w-[120px]" />
            </td>
        ))}
    </tr>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
    <table className="w-full">
        <tbody>
            {Array.from({ length: rows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns} />
            ))}
        </tbody>
    </table>
);

// Message skeleton
export const MessageSkeleton = ({ isRight = false }) => (
    <div className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] ${isRight ? 'bg-blue-100' : 'bg-gray-100'} rounded-2xl px-4 py-3 space-y-2`}>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
        </div>
    </div>
);

// Conversation list skeleton
export const ConversationListSkeleton = ({ count = 5 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
            </div>
        ))}
    </div>
);

export default {
    Skeleton,
    ProductCardSkeleton,
    ProductGridSkeleton,
    StatsCardSkeleton,
    StatsGridSkeleton,
    OrderRowSkeleton,
    OrderListSkeleton,
    TableRowSkeleton,
    TableSkeleton,
    MessageSkeleton,
    ConversationListSkeleton
};
