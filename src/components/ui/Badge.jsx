import { forwardRef } from 'react';

/**
 * Badge Component
 * 
 * Semantic tag/pill for statuses, categories, counts, and indicators.
 * Follows design tokens with accessible contrast in both light and dark modes.
 */
const Badge = forwardRef(({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className = '',
  ...props
}, ref) => {
  const variants = {
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    brand: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    dark: 'bg-gray-900 text-white border-gray-800',
  };

  const dotColors = {
    neutral: 'bg-gray-400',
    brand: 'bg-emerald-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    orange: 'bg-orange-500',
    dark: 'bg-emerald-400',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  const variantClass = variants[variant] || variants.neutral;
  const sizeClass = sizes[size] || sizes.md;
  const dotColor = dotColors[variant] || dotColors.neutral;

  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full border transition-colors ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} aria-hidden="true" />}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
