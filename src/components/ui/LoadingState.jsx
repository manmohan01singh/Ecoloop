import { Loader2 } from 'lucide-react';

/**
 * Loading State Component
 * 
 * Consistent loading indicators for different contexts.
 * 
 * @example
 * <LoadingState />
 * <LoadingState size="sm" text="Loading devices..." />
 * <LoadingState variant="inline" />
 */

export default function LoadingState({ 
  size = 'md', 
  text, 
  variant = 'centered',
  className = '' 
}) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const iconSize = sizes[size] || sizes.md;
  
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
        <Loader2 className={`${iconSize} animate-spin text-emerald-600`} />
        {text && <span className="text-sm text-gray-600">{text}</span>}
      </div>
    );
  }
  
  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`.trim()}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`${iconSize} animate-spin text-emerald-600`} />
          {text && <p className="text-sm font-medium text-gray-700">{text}</p>}
        </div>
      </div>
    );
  }
  
  // Centered (default)
  return (
    <div className={`flex items-center justify-center py-12 ${className}`.trim()}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${iconSize} animate-spin text-emerald-600`} />
        {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
      </div>
    </div>
  );
}
