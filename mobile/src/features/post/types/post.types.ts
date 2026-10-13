import { ExploreCategory, DeviceCondition } from '../../explore/types/explore.types';

export type PostStep = 1 | 2 | 3 | 4 | 5;

export type DeviceActionType = 'sell' | 'repair' | 'recycle';

export interface PostPhotoItem {
  id: string;
  uri: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

export interface PostFormData {
  photos: PostPhotoItem[];
  title: string;
  category: ExploreCategory;
  brand: string;
  model: string;
  condition: DeviceCondition;
  description: string;
  city: string;
  action: DeviceActionType;

  // Sell specifics
  price: string;
  isFree: boolean;
  originalPrice: string;
  pickupType: 'pickup' | 'dropoff' | 'both' | 'shipping';
  warrantyDays: string;

  // Repair specifics
  issueType: string;
  issueDetails: string;
  repairUrgency: 'standard' | 'urgent';
  preferredService: 'depot' | 'mail' | 'technician';

  // Recycle specifics
  disposalReason: string;
  certificateRequested: boolean;
  hasSwollenBattery: boolean;
  dropoffPreference: 'depot' | 'curbside';

  // Review confirmation
  confirmedAccurate: boolean;
}

export type PostFormErrors = Partial<Record<string, string>>;

export interface PostSubmissionResult {
  success: boolean;
  createdId?: string;
  error?: string;
}
