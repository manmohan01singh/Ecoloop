import { forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Card Component
 * 
 * Flexible container component with consistent styling.
 * Supports variants, hover states, and interactive modes.
 * 
 * @example
 * <Card>
 *   <Card.Header>
 *     <h2>Card Title</h2>
 *   </Card.Header>
 *   <Card.Body>
 *     Content goes here
 *   </Card.Body>
 *   <Card.Footer>
 *     <Button>Action</Button>
 *   </Card.Footer>
 * </Card>
 * 
 * <Card variant="flat" interactive onClick={handleClick}>
 *   Clickable card
 * </Card>
 */

const Card = forwardRef(({
  children,
  variant = 'elevated',
  padding = 'md',
  interactive = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  
  const baseStyles = `
    bg-white rounded-xl
    transition-all duration-200
    ${interactive ? 'cursor-pointer' : ''}
  `;
  
  const variants = {
    elevated: 'border border-gray-200 shadow-sm hover:shadow-md',
    flat: 'border border-gray-200',
    outlined: 'border-2 border-gray-300',
    ghost: 'border border-transparent hover:border-gray-200 hover:bg-gray-50',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const variantClass = variants[variant] || variants.elevated;
  const paddingClass = paddings[padding] || paddings.md;
  
  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: { scale: 1.01, y: -2 },
    whileTap: { scale: 0.99 },
  } : {};
  
  return (
    <Component
      ref={ref}
      onClick={onClick}
      className={`${baseStyles} ${variantClass} ${paddingClass} ${className}`.trim()}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

// Sub-components for semantic structure
Card.Header = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`mb-4 ${className}`.trim()} {...props}>
    {children}
  </div>
));
Card.Header.displayName = 'Card.Header';

Card.Body = forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`${className}`.trim()} {...props}>
    {children}
  </div>
));
Card.Body.displayName = 'Card.Body';

Card.Footer = forwardRef(({ children, className = '', ...props }, ref) => (
  <div 
    ref={ref} 
    className={`mt-4 pt-4 border-t border-gray-100 ${className}`.trim()} 
    {...props}
  >
    {children}
  </div>
));
Card.Footer.displayName = 'Card.Footer';

export default Card;
