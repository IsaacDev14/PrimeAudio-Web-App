import { cn } from '../../lib/utils';

const SIZES = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-12 h-12',
};

export function AppIcon({ icon: Icon, size = 'md', className }) {
    if (!Icon) return null;

    return (
        <Icon
            className={cn(SIZES[size], 'text-slate-700 flex-shrink-0', className)}
            strokeWidth={1.75}
        />
    );
}
