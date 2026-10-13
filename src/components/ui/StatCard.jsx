import { forwardRef } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from './Card';

/**
 * StatCard Component
 * 
 * Big-tech quality metric card with iconography, change indicators,
 * subtle background treatments, and formatted values.
 */
const StatCard = forwardRef(({
  title,
  value,
  unit,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  changeLabel = 'vs last month',
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBg = 'bg-emerald-50 border-emerald-100',
  progress,
  className = '',
  ...props
}, ref) => {
  return (
    <Card ref={ref} variant="elevated" className={`relative overflow-hidden group hover:border-emerald-200 transition-all ${className}`} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
            {unit && <span className="text-sm font-medium text-gray-500">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </div>

      {(change !== undefined || progress !== undefined) && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 font-semibold ${
                changeType === 'increase' ? 'text-emerald-600' :
                changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {changeType === 'increase' && <TrendingUp className="w-3.5 h-3.5" />}
                {changeType === 'decrease' && <TrendingDown className="w-3.5 h-3.5" />}
                {changeType === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                {change}
              </span>
              {changeLabel && <span className="text-gray-400">{changeLabel}</span>}
            </div>
          )}

          {progress !== undefined && (
            <div className="w-full ml-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
