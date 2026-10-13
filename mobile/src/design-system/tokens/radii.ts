export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // Apple standard grouped card radius
  xl: 20, // Featured interactive cards
  xxl: 24, // Sheets & action modals
  full: 9999, // Pills & rounded controls
} as const;

export type Radii = typeof radii;
