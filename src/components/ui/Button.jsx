import { forwardRef, isValidElement } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Button Component
 * 
 * World-class button with all interactive states, variants, and accessibility.
 * Follows design tokens system for consistent spacing, typography, and colors.
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save Changes
 * </Button>
 * 
 * <Button variant="secondary" size="sm" icon={<Plus />} loading>
 *   Add Item
 * </Button>
 */

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}, ref) => {
  
  // Base styles — always applied
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
  `;

  // Variant styles
  const variants = {
    primary: `
      bg-emerald-600 text-white
      hover:bg-emerald-700 active:bg-emerald-800
      focus:ring-emerald-500
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-gray-100 text-gray-900
      hover:bg-gray-200 active:bg-gray-300
      focus:ring-gray-400
      border border-gray-300
    `,
    outline: `
      bg-transparent text-emerald-600 border-2 border-emerald-600
      hover:bg-emerald-50 active:bg-emerald-100
      focus:ring-emerald-500
    `,
    ghost: `
      bg-transparent text-gray-700
      hover:bg-gray-100 active:bg-gray-200
      focus:ring-gray-400
    `,
    danger: `
      bg-red-600 text-white
      hover:bg-red-700 active:bg-red-800
      focus:ring-red-500
      shadow-sm hover:shadow-md
    `,
    dangerOutline: `
      bg-transparent text-red-600 border-2 border-red-600
      hover:bg-red-50 active:bg-red-100
      focus:ring-red-500
    `,
    success: `
      bg-green-600 text-white
      hover:bg-green-700 active:bg-green-800
      focus:ring-green-500
      shadow-sm hover:shadow-md
    `,
  };

  // Size styles (following design tokens — proper touch targets)
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[2rem]',          // 32px height
    md: 'px-4 py-2.5 text-sm min-h-[2.75rem]',     // 44px height (WCAG AAA touch target)
    lg: 'px-6 py-3 text-base min-h-[3rem]',        // 48px height
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  const renderIcon = (pos) => {
    if (loading || !icon || iconPosition !== pos) return null;
    if (isValidElement(icon)) {
      return <span className="flex-shrink-0" aria-hidden="true">{icon}</span>;
    }
    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <span className="flex-shrink-0" aria-hidden="true"><IconComponent className="w-4 h-4" /></span>;
    }
    return null;
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`.trim()}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      )}
      
      {renderIcon('left')}
      
      {children && <span>{children}</span>}
      
      {renderIcon('right')}
      
      {loading && <span className="sr-only">Loading...</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
