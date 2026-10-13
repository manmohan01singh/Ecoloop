/**
 * Progress Bar Component
 * Displays upload/download progress with percentage
 */
export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  showLabel = true,
  className
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variants = {
    primary: 'bg-emerald-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className || ''}`}>
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${variants[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-gray-600 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}
