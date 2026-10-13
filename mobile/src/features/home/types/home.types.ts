import { IconName } from '../../../components/ui';

export type CoreActionType = 'repair' | 'recycle' | 'sell' | 'buy';

export interface CoreActionConfig {
  id: CoreActionType;
  title: string;
  tagline: string;
  description: string;
  icon: IconName;
  tintColor: string;
  bgColor: string;
  badgeTextColor: string;
  statsLabel: string;
}

export interface RecentDeviceItem {
  id: string;
  title: string;
  category: 'smartphone' | 'laptop' | 'audio' | 'tablet' | 'gaming';
  action: CoreActionType;
  actionLabel: string;
  condition: 'like_new' | 'good' | 'fair' | 'for_parts';
  conditionLabel: string;
  price?: number;
  isFree?: boolean;
  distanceKm: number;
  city: string;
  imageUrl: string;
  co2SavedKg: number;
}

export interface CircularStatItem {
  id: string;
  label: string;
  value: string;
  icon: IconName;
  detail: string;
}

export interface CommunityHubItem {
  id: string;
  name: string;
  type: 'Repair Cafe' | 'Drop-off Depot' | 'Refurbisher' | 'Exchange Point';
  distance: string;
  address: string;
  verified: boolean;
  rating: number;
}
