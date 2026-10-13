export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screenHorizontal: 16,
  screenTop: 12,
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
} as const;

export type Spacing = typeof spacing;
