import { forwardRef } from 'react';

/**
 * Tabs Component
 * 
 * Accessible, keyboard-friendly tab strip with animated pill / underline style.
 */
export const Tabs = forwardRef(({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pill', // 'pill' | 'underline'
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        variant === 'pill' ? 'p-1 bg-gray-100 rounded-2xl w-fit' : 'border-b border-gray-200 w-full'
      } ${className}`.trim()}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;
