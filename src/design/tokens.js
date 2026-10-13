/**
 * EcoLoop Design System Tokens
 * 
 * Centralized design tokens for consistent visual language.
 * Based on Tailwind CSS values but with semantic naming.
 * 
 * Usage: Import and reference in components or extend Tailwind config.
 * Goal: Eliminate arbitrary values, establish systematic scale.
 */

// ═══════════════════════════════════════════════════════════
// SPACING SCALE
// ═══════════════════════════════════════════════════════════

export const spacing = {
  // Base unit: 4px (0.25rem)
  0: '0',
  1: '0.25rem',   // 4px - tight gaps
  2: '0.5rem',    // 8px - compact spacing
  3: '0.75rem',   // 12px - small padding
  4: '1rem',      // 16px - base unit
  5: '1.25rem',   // 20px - comfortable padding
  6: '1.5rem',    // 24px - section spacing
  8: '2rem',      // 32px - large padding
  10: '2.5rem',   // 40px - major sections
  12: '3rem',     // 48px - page margins
  16: '4rem',     // 64px - hero spacing
  20: '5rem',     // 80px - extra large
  24: '6rem',     // 96px - max spacing
};

// ═══════════════════════════════════════════════════════════
// TYPOGRAPHY SCALE
// ═══════════════════════════════════════════════════════════

export const typography = {
  fontSize: {
    // Display & Hero
    '5xl': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '700' }],       // 48px - Hero headlines
    '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],      // 40px - Page titles
    '3xl': ['2rem', { lineHeight: '1.125', letterSpacing: '-0.01em', fontWeight: '700' }],      // 32px - Section headers
    
    // Headings
    '2xl': ['1.5rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '700' }],           // 24px - Card titles
    'xl': ['1.25rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],            // 20px - Subheadings
    'lg': ['1.125rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],           // 18px - Component headers
    
    // Body & UI
    'base': ['1rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],             // 16px - Body text
    'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],           // 14px - Secondary text
    'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],       // 12px - Metadata, labels
    '2xs': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.01em', fontWeight: '500' }],    // 11px - Tiny text
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ═══════════════════════════════════════════════════════════
// COLOR SYSTEM
// ═══════════════════════════════════════════════════════════

export const colors = {
  // Primary Brand — Emerald (sustainability, growth)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',   // Primary action color
    600: '#16a34a',   // Primary hover/active
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Neutral — Gray scale
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Semantic Colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#059669',
  },
  
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
  
  // Role-Specific Brand Colors
  roles: {
    admin: {
      light: '#fee2e2',
      DEFAULT: '#ef4444',
      dark: '#dc2626',
      bg: '#fef2f2',
      text: '#b91c1c',
    },
    moderator: {
      light: '#dbeafe',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
      bg: '#eff6ff',
      text: '#1e40af',
    },
    recycler: {
      light: '#d1fae5',
      DEFAULT: '#10b981',
      dark: '#059669',
      bg: '#ecfdf5',
      text: '#047857',
    },
    repair_provider: {
      light: '#fed7aa',
      DEFAULT: '#f97316',
      dark: '#ea580c',
      bg: '#fff7ed',
      text: '#c2410c',
    },
    business: {
      light: '#c7d2fe',
      DEFAULT: '#6366f1',
      dark: '#4f46e5',
      bg: '#eef2ff',
      text: '#4338ca',
    },
    organization: {
      light: '#fde68a',
      DEFAULT: '#f59e0b',
      dark: '#d97706',
      bg: '#fffbeb',
      text: '#b45309',
    },
    user: {
      light: '#d1fae5',
      DEFAULT: '#10b981',
      dark: '#059669',
      bg: '#f0fdf4',
      text: '#047857',
    },
  },
};

// ═══════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════

export const borderRadius = {
  none: '0',
  sm: '0.375rem',    // 6px - tight corners
  DEFAULT: '0.5rem',  // 8px - standard
  md: '0.5rem',      // 8px - cards, inputs
  lg: '0.75rem',     // 12px - buttons, badges
  xl: '1rem',        // 16px - modals, major components
  '2xl': '1.25rem',  // 20px - hero cards
  full: '9999px',    // Pills, avatars
};

// ═══════════════════════════════════════════════════════════
// SHADOWS & ELEVATION
// ═══════════════════════════════════════════════════════════

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',                          // Subtle lift
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',  // Standard cards
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',    // Hover states
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',  // Modals, dropdowns
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Large overlays
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',                 // Maximum depth
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',                 // Recessed elements
};

// ═══════════════════════════════════════════════════════════
// COMPONENT SIZING
// ═══════════════════════════════════════════════════════════

export const components = {
  button: {
    height: {
      sm: '2rem',      // 32px
      md: '2.5rem',    // 40px - default
      lg: '3rem',      // 48px
    },
    padding: {
      sm: '0.5rem 0.75rem',   // 8px 12px
      md: '0.625rem 1rem',    // 10px 16px
      lg: '0.75rem 1.5rem',   // 12px 24px
    },
  },
  
  input: {
    height: {
      sm: '2rem',      // 32px
      md: '2.75rem',   // 44px - default (better touch target)
      lg: '3rem',      // 48px
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
  },
  
  card: {
    padding: {
      sm: '1rem',      // 16px
      md: '1.25rem',   // 20px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
    },
  },
  
  // Minimum touch target size (WCAG AAA)
  touchTarget: '44px',
  
  // Icon sizes
  icon: {
    xs: '0.875rem',   // 14px
    sm: '1rem',       // 16px
    md: '1.25rem',    // 20px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
  },
};

// ═══════════════════════════════════════════════════════════
// MOTION & TRANSITIONS
// ═══════════════════════════════════════════════════════════

export const motion = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Bouncy
  },
  
  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 },
    },
    
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: 0.2 },
    },
  },
};

// ═══════════════════════════════════════════════════════════
// Z-INDEX SCALE
// ═══════════════════════════════════════════════════════════

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
};

// ═══════════════════════════════════════════════════════════
// BREAKPOINTS (Responsive)
// ═══════════════════════════════════════════════════════════

export const breakpoints = {
  sm: '640px',   // Mobile landscape, small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// ═══════════════════════════════════════════════════════════
// ACCESSIBILITY
// ═══════════════════════════════════════════════════════════

export const a11y = {
  // WCAG 2.2 AA minimum contrast ratios
  contrast: {
    normalText: 4.5,      // Body text, small text
    largeText: 3,         // >= 18px or >= 14px bold
    uiComponents: 3,      // Borders, icons, interactive elements
  },
  
  // Minimum touch/click target
  minTarget: {
    width: '44px',
    height: '44px',
  },
  
  // Focus ring
  focusRing: {
    width: '2px',
    offset: '2px',
    color: colors.primary[500],
    style: 'solid',
  },
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  spacing,
  typography,
  colors,
  borderRadius,
  shadows,
  components,
  motion,
  zIndex,
  breakpoints,
  a11y,
};
