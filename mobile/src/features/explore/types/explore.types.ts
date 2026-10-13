export type ExploreCategory =
  | 'all'
  | 'smartphone'
  | 'laptop'
  | 'tablet'
  | 'audio'
  | 'gaming'
  | 'parts'
  | 'wearable'
  | 'other';

export type ExploreAction = 'all' | 'sell' | 'repair' | 'recycle' | 'buy';

export type DeviceCondition = 'like_new' | 'good' | 'fair' | 'for_parts';

export type ExploreSort = 'nearest' | 'price_asc' | 'price_desc' | 'co2' | 'newest';

export interface ExploreItem {
  id: string;
  title: string;
  category: ExploreCategory;
  categoryLabel: string;
  action: 'sell' | 'repair' | 'recycle' | 'buy';
  actionLabel: string;
  condition: DeviceCondition;
  conditionLabel: string;
  price: number;
  isFree?: boolean;
  originalPrice?: number;
  city: string;
  distanceKm: number;
  imageUrl: string;
  additionalImages?: string[];
  co2SavedKg: number;
  batteryHealth?: number; // percentage (e.g. 88%)
  warrantyDays?: number;
  description: string;
  specs?: { [key: string]: string };
  sellerName?: string;
  sellerRating?: number;
  pickupType: 'pickup' | 'dropoff' | 'both' | 'shipping';
  createdAt: string;
  isDevFixture: boolean;
}

export interface ExploreFilters {
  query: string;
  category: ExploreCategory;
  action: ExploreAction;
  condition: 'all' | DeviceCondition;
  sort: ExploreSort;
  onlyFree: boolean;
  maxDistanceKm?: number;
}
