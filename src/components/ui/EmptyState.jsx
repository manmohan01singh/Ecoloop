import { isValidElement } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from './Button';

/**
 * Empty State Component
 * 
 * User-friendly empty state with icon, message, and call-to-action.
 * Safely handles icon components/elements and action objects/elements.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: 'bg-white border border-gray-200/90 rounded-2xl shadow-xs',
    minimal: 'bg-transparent',
    card: 'bg-gray-50/80 border border-gray-200/80 rounded-2xl',
  };
  
  const variantClass = variants[variant] || variants.default;

  const renderIcon = () => {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <IconComponent className="w-12 h-12 text-gray-400" aria-hidden="true" />;
    }
    return null;
  };

  const renderAction = () => {
    if (!action) return null;
    if (isValidElement(action)) return action;
    if (typeof action === 'object') {
      const btn = (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          variant={action.variant || 'primary'}
          size={action.size || 'md'}
        >
          {action.label}
        </Button>
      );
      if (action.href) {
        return <Link to={action.href}>{btn}</Link>;
      }
      return btn;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`text-center py-12 px-6 ${variantClass} ${className}`.trim()}
    >
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4 text-gray-300">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
            {renderIcon()}
          </div>
        </div>
      )}
      
      {/* Title */}
      {title && (
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 font-display">
          {title}
        </h3>
      )}
      
      {/* Description */}
      {description && (
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      {/* Action */}
      {action && (
        <div className="flex justify-center">
          {renderAction()}
        </div>
      )}
    </motion.div>
  );
}
