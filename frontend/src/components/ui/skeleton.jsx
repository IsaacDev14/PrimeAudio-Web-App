import { cn } from "../../lib/utils";

// Base Skeleton with shimmer animation
function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer",
                className
            )}
            {...props}
        />
    );
}

// Product Card Skeleton
function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Product Grid Skeleton (multiple cards)
function ProductGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Hero Section Skeleton
function HeroSkeleton() {
    return (
        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <Skeleton className="absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-6 w-48 mx-auto" />
                    <Skeleton className="h-12 w-36 mx-auto rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Category Card Skeleton
function CategoryCardSkeleton() {
    return (
        <div className="relative aspect-square rounded-xl overflow-hidden">
            <Skeleton className="absolute inset-0" />
            <div className="absolute bottom-4 left-4 right-4">
                <Skeleton className="h-6 w-24" />
            </div>
        </div>
    );
}

// Categories Grid Skeleton
function CategoriesGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CategoryCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Product Details Skeleton
function ProductDetailsSkeleton() {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <Skeleton className="h-10 w-32" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex gap-4 pt-4">
                    <Skeleton className="h-12 w-32 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Table Row Skeleton (for admin pages)
function TableRowSkeleton({ columns = 5 }) {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

// Table Skeleton
function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="p-4 text-left">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Stat Card Skeleton (for dashboard)
function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        </div>
    );
}

// Dashboard Skeleton
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
            {/* Chart Area */}
            <Skeleton className="h-80 w-full rounded-xl" />
            {/* Table */}
            <TableSkeleton rows={5} columns={5} />
        </div>
    );
}

// Full Page Loading
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-500 text-sm animate-pulse">Loading...</p>
            </div>
        </div>
    );
}

export {
    Skeleton,
    ProductCardSkeleton,
    ProductGridSkeleton,
    HeroSkeleton,
    CategoryCardSkeleton,
    CategoriesGridSkeleton,
    ProductDetailsSkeleton,
    TableRowSkeleton,
    TableSkeleton,
    StatCardSkeleton,
    DashboardSkeleton,
    PageLoader
};
