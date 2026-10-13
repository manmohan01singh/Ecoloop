export type AppRole = 'consumer' | 'repair_pro' | 'recycler' | 'business' | 'moderator' | 'admin';
export type WorkspaceKey = 'consumer' | 'repair_pro' | 'recycler' | 'business' | 'moderator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  city: string;
  role: 'member' | 'business' | 'moderator' | 'admin' | 'repair_pro' | 'recycler';
  roles?: AppRole[];
  activeWorkspace?: WorkspaceKey;
  karmaPoints: number;
  co2DivertedKg: number;
  preferences: {
    notifications: boolean;
    theme: string;
    emailAlerts: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  orgType: 'repair_shop' | 'recycler' | 'refurbisher' | 'business_seller';
  registrationNumber: string;
  verified: boolean;
  city: string;
  address: string;
  contactEmail: string;
  phone: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'manager' | 'technician' | 'staff' | 'viewer';
  createdAt: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  role: AppRole;
  organizationId?: string;
  grantedBy?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProviderApplication {
  id: string;
  userId: string;
  applicationType: 'repair_pro' | 'recycler' | 'business';
  businessName: string;
  registrationNumber: string;
  categories: string[];
  serviceArea: string;
  documentationUrls: string[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  reviewerId?: string;
  reviewerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  organizationId?: string;
  providerType: 'repair_pro' | 'recycler' | 'business';
  businessName: string;
  bio: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  specialties: string[];
  certifications: string[];
  serviceRadiusKm: number;
  verifiedAt?: string;
  createdAt: string;
}

export interface DeviceListingRecord {
  id: string;
  ownerId: string;
  title: string;
  deviceCategory: string;
  brand: string;
  model: string;
  condition: string;
  description: string;
  pathway: 'sell' | 'repair' | 'recycle';
  status: 'active' | 'pending' | 'completed' | 'archived';
  price: number;
  isFree: boolean;
  originalPrice?: number;
  city: string;
  pickupType: 'dropoff' | 'pickup' | 'shipping' | 'both';
  warrantyDays?: number;
  issueType?: string;
  issueDetails?: string;
  disposalReason?: string;
  certificateRequested: boolean;
  co2SavedKg: number;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEventRecord {
  id: string;
  recipientId: string;
  actorId?: string;
  eventType: 'listing_created' | 'listing_status_changed' | 'account_created' | 'karma_earned' | 'system_notice';
  entityType: 'device_listing' | 'profile' | 'system';
  entityId?: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
  readAt: string | null;
  createdAt: string;
}

export interface RepairRequest {
  id: string;
  customerId: string;
  customerName: string;
  deviceCategory: string;
  brand: string;
  model: string;
  issueType: string;
  symptoms: string;
  photos: string[];
  urgency: 'low' | 'standard' | 'express';
  preferredServiceType: 'dropoff' | 'pickup' | 'mail_in';
  city: string;
  status: 'submitted' | 'matching' | 'quoted' | 'accepted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  acceptedQuoteId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairQuote {
  id: string;
  repairRequestId: string;
  providerId: string;
  providerName: string;
  partsCost: number;
  laborCost: number;
  diagnosticFee: number;
  totalAmount: number;
  estimatedTurnaroundDays: number;
  warrantyDays: number;
  notes: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

export interface RecyclingRequest {
  id: string;
  userId: string;
  userName: string;
  deviceCategory: string;
  brand: string;
  model: string;
  quantity: number;
  estimatedWeightKg: number;
  condition: string;
  hasHazardousBattery: boolean;
  collectionType: 'dropoff' | 'pickup';
  address: string;
  city: string;
  status: 'requested' | 'eligibility_checked' | 'accepted' | 'scheduled' | 'collected' | 'received' | 'processing' | 'closed' | 'cancelled';
  assignedRecyclerId?: string;
  assignedRecyclerName?: string;
  certificateNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEvent {
  id: string;
  recyclingRequestId: string;
  recyclerId: string;
  recyclerName: string;
  verifiedWeightKg: number;
  hazardousNotes?: string;
  processingStage: 'dismantled' | 'materials_recovered' | 'certified_destruction';
  certificateNumber: string;
  dispositionSummary: string;
  recordedAt: string;
}

export interface InventoryItem {
  id: string;
  organizationId?: string;
  ownerId: string;
  sku: string;
  title: string;
  deviceCategory: string;
  brand: string;
  model: string;
  conditionGrade: 'A+' | 'A' | 'B' | 'C' | 'For Parts';
  quantity: number;
  unitPrice: number;
  isWholesale: boolean;
  minimumOrderQty: number;
  refurbishedInspected: boolean;
  warrantyDays: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferRecord {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  offerAmount: number;
  counterAmount?: number;
  message: string;
  status: 'pending' | 'accepted' | 'countered' | 'declined' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface DevicePassportEvent {
  id: string;
  deviceIdentifier: string; // IMEI, Serial or Listing UUID
  listingId?: string;
  eventType: 'first_listed' | 'ownership_transfer' | 'reported_repair' | 'verified_repair' | 'parts_replaced' | 'refurbishment_inspection' | 'recycler_collected' | 'responsibly_processed';
  actorId: string;
  actorRole: string;
  actorName: string;
  verificationTier: 'user_reported' | 'provider_reported' | 'evidence_backed' | 'certified';
  summary: string;
  evidenceUrl?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'listing' | 'user' | 'provider' | 'quote';
  targetId: string;
  targetTitle: string;
  category: 'spam' | 'counterfeit' | 'hazardous_item' | 'prohibited_device' | 'fraud' | 'other';
  description: string;
  evidenceUrls: string[];
  status: 'new' | 'under_review' | 'actioned' | 'dismissed';
  assignedModeratorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationAction {
  id: string;
  reportId?: string;
  moderatorId: string;
  moderatorName: string;
  targetType: string;
  targetId: string;
  actionTaken: 'warning_issued' | 'content_hidden' | 'content_removed' | 'user_suspended' | 'escalated_to_admin' | 'dismissed';
  justification: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  createdAt: string;
}

const STORAGE_KEYS = {
  SESSION: 'ecoloop_auth_session_v1',
  PROFILES: 'ecoloop_user_profiles_v1',
  LISTINGS: 'ecoloop_persisted_listings_v1',
  ACTIVITIES: 'ecoloop_activity_events_v1',
  ORGANIZATIONS: 'ecoloop_organizations_v1',
  ROLE_ASSIGNMENTS: 'ecoloop_role_assignments_v1',
  PROVIDER_APPLICATIONS: 'ecoloop_provider_applications_v1',
  PROVIDER_PROFILES: 'ecoloop_provider_profiles_v1',
  REPAIR_REQUESTS: 'ecoloop_repair_requests_v1',
  REPAIR_QUOTES: 'ecoloop_repair_quotes_v1',
  RECYCLING_REQUESTS: 'ecoloop_recycling_requests_v1',
  COLLECTION_EVENTS: 'ecoloop_collection_events_v1',
  INVENTORY_ITEMS: 'ecoloop_inventory_items_v1',
  OFFERS: 'ecoloop_offers_v1',
  PASSPORT_EVENTS: 'ecoloop_passport_events_v1',
  MODERATION_REPORTS: 'ecoloop_moderation_reports_v1',
  MODERATION_ACTIONS: 'ecoloop_moderation_actions_v1',
  AUDIT_LOGS: 'ecoloop_audit_logs_v1',
};

import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory cache + persistent native driver backing
let memoryStore: Record<string, string> = {};

// Hydrate from native AsyncStorage on startup
export async function hydrateFromNativeStorage(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    if (typeof AsyncStorage !== 'undefined' && typeof AsyncStorage.getMany === 'function') {
      const records = await AsyncStorage.getMany(keys);
      Object.entries(records).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          memoryStore[k] = v;
        }
      });
    }
  } catch {
    // Fall back to memoryStore
  }
}

// Trigger initial hydration in background
if (typeof AsyncStorage !== 'undefined' && typeof AsyncStorage?.getMany === 'function') {
  hydrateFromNativeStorage().catch(() => {});
}

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // Ignore
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch {
    // Ignore
  }
  memoryStore[key] = val;
  try {
    if (typeof AsyncStorage !== 'undefined' && AsyncStorage?.setItem) {
      AsyncStorage.setItem(key, val).catch(() => {});
    }
  } catch {
    // Ignore
  }
}

// Global pub-sub listeners
export type DataChangeType =
  | 'listings'
  | 'activities'
  | 'auth'
  | 'repairs'
  | 'recycling'
  | 'inventory'
  | 'offers'
  | 'passport'
  | 'moderation'
  | 'admin';

type DataChangeListener = (type: DataChangeType) => void;
const listeners = new Set<DataChangeListener>();

export function subscribeToDataChanges(listener: DataChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySubscribers(type: DataChangeType): void {
  listeners.forEach((fn) => {
    try {
      fn(type);
    } catch {
      // Ignore listener error
    }
  });
}

// -----------------------------------------------------------------------------
// PROFILE & AUTH PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredSessionUser(): { user: { id: string; email: string }; profile: UserProfile } | null {
  const raw = safeGetItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSessionUser(session: { user: { id: string; email: string }; profile: UserProfile } | null): void {
  if (session) {
    safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    saveProfile(session.profile);
  } else {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch {
      // Ignore
    }
    delete memoryStore[STORAGE_KEYS.SESSION];
  }
  notifySubscribers('auth');
}

export function getAllProfiles(): Record<string, UserProfile> {
  const raw = safeGetItem(STORAGE_KEYS.PROFILES);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveProfile(profile: UserProfile): void {
  const profiles = getAllProfiles();
  profiles[profile.id] = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  safeSetItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

  const activeSession = getStoredSessionUser();
  if (activeSession && activeSession.profile.id === profile.id) {
    activeSession.profile = profiles[profile.id];
    safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify(activeSession));
  }
  notifySubscribers('auth');
}

export function getProfileById(id: string): UserProfile | null {
  const profiles = getAllProfiles();
  return profiles[id] || null;
}

export function getCategoryFallbackImage(category?: string): string {
  const normalized = (category || '').toLowerCase().trim();
  switch (normalized) {
    case 'smartphone':
    case 'smartphones':
    case 'phone':
    case 'phones':
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
    case 'laptop':
    case 'laptops':
    case 'computer':
      return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80';
    case 'audio':
    case 'headphones':
      return 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80';
    case 'tablet':
    case 'tablets':
    case 'ipad':
      return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80';
    case 'gaming':
    case 'console':
      return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80';
    case 'wearable':
    case 'wearables':
    case 'smartwatch':
      return 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80';
    case 'parts':
      return 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80';
    default:
      return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80';
  }
}

// -----------------------------------------------------------------------------
// DEVICE LISTINGS PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredListings(): DeviceListingRecord[] {
  const raw = safeGetItem(STORAGE_KEYS.LISTINGS);
  if (!raw) return [];
  try {
    const list: DeviceListingRecord[] = JSON.parse(raw);
    let mutated = false;
    const sanitized = list.map((item) => {
      const hasBlob = item.photos && item.photos.some((p) => typeof p === 'string' && p.startsWith('blob:'));
      if (hasBlob) {
        mutated = true;
        return {
          ...item,
          photos: item.photos.map((p) =>
            typeof p === 'string' && p.startsWith('blob:')
              ? getCategoryFallbackImage(item.deviceCategory)
              : p
          ),
        };
      }
      return item;
    });

    if (mutated) {
      safeSetItem(STORAGE_KEYS.LISTINGS, JSON.stringify(sanitized));
    }
    return sanitized;
  } catch {
    return [];
  }
}

export function saveListing(listing: DeviceListingRecord): void {
  const sanitizedPhotos = (listing.photos || []).map((p) =>
    typeof p === 'string' && p.startsWith('blob:')
      ? getCategoryFallbackImage(listing.deviceCategory)
      : p
  );
  const cleanListing = { ...listing, photos: sanitizedPhotos };

  const current = getStoredListings();
  const existingIdx = current.findIndex((item) => item.id === cleanListing.id);

  if (existingIdx >= 0) {
    current[existingIdx] = { ...cleanListing, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(cleanListing);
  }

  safeSetItem(STORAGE_KEYS.LISTINGS, JSON.stringify(current));
  notifySubscribers('listings');
}

export function getListingsByOwner(ownerId: string): DeviceListingRecord[] {
  return getStoredListings().filter((l) => l.ownerId === ownerId);
}

// -----------------------------------------------------------------------------
// ACTIVITY EVENTS PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredActivities(): ActivityEventRecord[] {
  const raw = safeGetItem(STORAGE_KEYS.ACTIVITIES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveActivityEvent(event: ActivityEventRecord): void {
  const current = getStoredActivities();
  const exists = current.some((e) => e.id === event.id);
  if (!exists) {
    current.unshift(event);
    safeSetItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(current));
    notifySubscribers('activities');
  }
}

export function getActivitiesForRecipient(recipientId: string): ActivityEventRecord[] {
  return getStoredActivities().filter((e) => e.recipientId === recipientId);
}

export function markActivityRead(id: string, recipientId: string): void {
  const current = getStoredActivities();
  let changed = false;
  const updated = current.map((e) => {
    if (e.id === id && e.recipientId === recipientId && !e.readAt) {
      changed = true;
      return { ...e, readAt: new Date().toISOString() };
    }
    return e;
  });

  if (changed) {
    safeSetItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    notifySubscribers('activities');
  }
}

export function markAllActivitiesRead(recipientId: string): void {
  const current = getStoredActivities();
  let changed = false;
  const updated = current.map((e) => {
    if (e.recipientId === recipientId && !e.readAt) {
      changed = true;
      return { ...e, readAt: new Date().toISOString() };
    }
    return e;
  });

  if (changed) {
    safeSetItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    notifySubscribers('activities');
  }
}

// -----------------------------------------------------------------------------
// REPAIR WORKFLOW PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredRepairRequests(): RepairRequest[] {
  const raw = safeGetItem(STORAGE_KEYS.REPAIR_REQUESTS);
  if (!raw) return getDefaultRepairRequests();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultRepairRequests();
  }
}

export function saveRepairRequest(request: RepairRequest): void {
  const current = getStoredRepairRequests();
  const idx = current.findIndex((r) => r.id === request.id);
  if (idx >= 0) {
    current[idx] = { ...request, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(request);
  }
  safeSetItem(STORAGE_KEYS.REPAIR_REQUESTS, JSON.stringify(current));
  notifySubscribers('repairs');
}

export function getStoredRepairQuotes(): RepairQuote[] {
  const raw = safeGetItem(STORAGE_KEYS.REPAIR_QUOTES);
  if (!raw) return getDefaultRepairQuotes();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultRepairQuotes();
  }
}

export function saveRepairQuote(quote: RepairQuote): void {
  const current = getStoredRepairQuotes();
  const idx = current.findIndex((q) => q.id === quote.id);
  if (idx >= 0) {
    current[idx] = quote;
  } else {
    current.unshift(quote);
  }
  safeSetItem(STORAGE_KEYS.REPAIR_QUOTES, JSON.stringify(current));
  notifySubscribers('repairs');
}

// -----------------------------------------------------------------------------
// RECYCLING WORKFLOW PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredRecyclingRequests(): RecyclingRequest[] {
  const raw = safeGetItem(STORAGE_KEYS.RECYCLING_REQUESTS);
  if (!raw) return getDefaultRecyclingRequests();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultRecyclingRequests();
  }
}

export function saveRecyclingRequest(req: RecyclingRequest): void {
  const current = getStoredRecyclingRequests();
  const idx = current.findIndex((r) => r.id === req.id);
  if (idx >= 0) {
    current[idx] = { ...req, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(req);
  }
  safeSetItem(STORAGE_KEYS.RECYCLING_REQUESTS, JSON.stringify(current));
  notifySubscribers('recycling');
}

export function getStoredCollectionEvents(): CollectionEvent[] {
  const raw = safeGetItem(STORAGE_KEYS.COLLECTION_EVENTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCollectionEvent(event: CollectionEvent): void {
  const current = getStoredCollectionEvents();
  current.unshift(event);
  safeSetItem(STORAGE_KEYS.COLLECTION_EVENTS, JSON.stringify(current));
  notifySubscribers('recycling');
}

// -----------------------------------------------------------------------------
// BUSINESS INVENTORY PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredInventoryItems(): InventoryItem[] {
  const raw = safeGetItem(STORAGE_KEYS.INVENTORY_ITEMS);
  if (!raw) return getDefaultInventoryItems();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultInventoryItems();
  }
}

export function saveInventoryItem(item: InventoryItem): void {
  const current = getStoredInventoryItems();
  const idx = current.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    current[idx] = { ...item, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(item);
  }
  safeSetItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(current));
  notifySubscribers('inventory');
}

export function saveInventoryItemsBatch(items: InventoryItem[]): void {
  const current = getStoredInventoryItems();
  items.forEach((item) => {
    const idx = current.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      current[idx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      current.unshift(item);
    }
  });
  safeSetItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(current));
  notifySubscribers('inventory');
}

// -----------------------------------------------------------------------------
// PROVIDER APPLICATIONS PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredProviderApplications(): ProviderApplication[] {
  const raw = safeGetItem(STORAGE_KEYS.PROVIDER_APPLICATIONS);
  if (!raw) return getDefaultProviderApplications();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultProviderApplications();
  }
}

export function saveProviderApplication(app: ProviderApplication): void {
  const current = getStoredProviderApplications();
  const idx = current.findIndex((a) => a.id === app.id);
  if (idx >= 0) {
    current[idx] = { ...app, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(app);
  }
  safeSetItem(STORAGE_KEYS.PROVIDER_APPLICATIONS, JSON.stringify(current));
  notifySubscribers('admin');
}

// -----------------------------------------------------------------------------
// DEVICE PASSPORT PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredPassportEvents(): DevicePassportEvent[] {
  const raw = safeGetItem(STORAGE_KEYS.PASSPORT_EVENTS);
  if (!raw) return getDefaultPassportEvents();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultPassportEvents();
  }
}

export function savePassportEvent(event: DevicePassportEvent): void {
  const current = getStoredPassportEvents();
  current.unshift(event);
  safeSetItem(STORAGE_KEYS.PASSPORT_EVENTS, JSON.stringify(current));
  notifySubscribers('passport');
}

// -----------------------------------------------------------------------------
// MODERATION & REPORTS PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredModerationReports(): ModerationReport[] {
  const raw = safeGetItem(STORAGE_KEYS.MODERATION_REPORTS);
  if (!raw) return getDefaultModerationReports();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultModerationReports();
  }
}

export function saveModerationReport(report: ModerationReport): void {
  const current = getStoredModerationReports();
  const idx = current.findIndex((r) => r.id === report.id);
  if (idx >= 0) {
    current[idx] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(report);
  }
  safeSetItem(STORAGE_KEYS.MODERATION_REPORTS, JSON.stringify(current));
  notifySubscribers('moderation');
}

export function getStoredModerationActions(): ModerationAction[] {
  const raw = safeGetItem(STORAGE_KEYS.MODERATION_ACTIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveModerationAction(action: ModerationAction): void {
  const current = getStoredModerationActions();
  current.unshift(action);
  safeSetItem(STORAGE_KEYS.MODERATION_ACTIONS, JSON.stringify(current));
  notifySubscribers('moderation');
}

// -----------------------------------------------------------------------------
// ADMIN AUDIT LOGS
// -----------------------------------------------------------------------------

export function getStoredAuditLogs(): AuditLogRecord[] {
  const raw = safeGetItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!raw) return getDefaultAuditLogs();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultAuditLogs();
  }
}

export function saveAuditLog(log: AuditLogRecord): void {
  const current = getStoredAuditLogs();
  current.unshift(log);
  safeSetItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(current));
  notifySubscribers('admin');
}

// -----------------------------------------------------------------------------
// OFFERS PERSISTENCE
// -----------------------------------------------------------------------------

export function getStoredOffers(): OfferRecord[] {
  const raw = safeGetItem(STORAGE_KEYS.OFFERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOffer(offer: OfferRecord): void {
  const current = getStoredOffers();
  const idx = current.findIndex((o) => o.id === offer.id);
  if (idx >= 0) {
    current[idx] = { ...offer, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(offer);
  }
  safeSetItem(STORAGE_KEYS.OFFERS, JSON.stringify(current));
  notifySubscribers('offers');
}

// -----------------------------------------------------------------------------
// DEFAULT MOCK FIXTURES FOR REALISTIC WORKSPACE DEMONSTRATIONS
// -----------------------------------------------------------------------------

function getDefaultRepairRequests(): RepairRequest[] {
  return [
    {
      id: 'rep-req-001',
      customerId: 'user-sample-01',
      customerName: 'Elena Rostova',
      deviceCategory: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      issueType: 'Broken OLED Screen',
      symptoms: 'Screen flickers green after corner impact. Touch still responds in upper half.',
      photos: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'],
      urgency: 'express',
      preferredServiceType: 'dropoff',
      city: 'Metro Vancouver',
      status: 'submitted',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'rep-req-002',
      customerId: 'user-sample-02',
      customerName: 'Marcus Chen',
      deviceCategory: 'laptop',
      brand: 'Apple',
      model: 'MacBook Pro 14" M1',
      issueType: 'Degraded Battery',
      symptoms: 'Battery health at 68%. Shuts down under heavy Xcode compile load.',
      photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
      urgency: 'standard',
      preferredServiceType: 'mail_in',
      city: 'Richmond',
      status: 'quoted',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}

function getDefaultRepairQuotes(): RepairQuote[] {
  return [
    {
      id: 'quote-001',
      repairRequestId: 'rep-req-002',
      providerId: 'pro-ifix-01',
      providerName: 'Apex Micro-Soldering & Labs',
      partsCost: 110,
      laborCost: 65,
      diagnosticFee: 0,
      totalAmount: 175,
      estimatedTurnaroundDays: 2,
      warrantyDays: 180,
      notes: 'OEM-grade Grade-A cobalt cells. Includes complete thermal paste renewal and diagnostics.',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ];
}

function getDefaultRecyclingRequests(): RecyclingRequest[] {
  return [
    {
      id: 'rec-req-001',
      userId: 'user-sample-03',
      userName: 'Sarah Jenkins',
      deviceCategory: 'laptop',
      brand: 'Dell',
      model: 'Latitude E7470 (Batch of 4)',
      quantity: 4,
      estimatedWeightKg: 6.8,
      condition: 'Non-functional / EOL',
      hasHazardousBattery: false,
      collectionType: 'dropoff',
      address: '450 West Georgia St',
      city: 'Metro Vancouver',
      status: 'accepted',
      assignedRecyclerId: 'rec-org-01',
      assignedRecyclerName: 'Pacific Rim Circular Metals',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'rec-req-002',
      userId: 'user-sample-04',
      userName: 'David Miller',
      deviceCategory: 'tablet',
      brand: 'Samsung',
      model: 'Galaxy Tab A 10.1',
      quantity: 1,
      estimatedWeightKg: 0.5,
      condition: 'Swollen Battery - Safety Risk',
      hasHazardousBattery: true,
      collectionType: 'pickup',
      address: '2288 Kingsway',
      city: 'Burnaby',
      status: 'requested',
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ];
}

function getDefaultInventoryItems(): InventoryItem[] {
  return [
    {
      id: 'inv-item-001',
      ownerId: 'biz-owner-01',
      sku: 'IPH-13-128-BLK-A',
      title: 'iPhone 13 128GB Midnight (Grade A Refurbished)',
      deviceCategory: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 13',
      conditionGrade: 'A',
      quantity: 14,
      unitPrice: 420,
      isWholesale: true,
      minimumOrderQty: 3,
      refurbishedInspected: true,
      warrantyDays: 180,
      notes: 'New OEM display, 100% battery, fully certified 30-point diagnostics.',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 'inv-item-002',
      ownerId: 'biz-owner-01',
      sku: 'MBP-M1-16-512-SG',
      title: 'MacBook Pro 14" M1 Pro 16GB 512GB Space Gray',
      deviceCategory: 'laptop',
      brand: 'Apple',
      model: 'MacBook Pro 14"',
      conditionGrade: 'A+',
      quantity: 6,
      unitPrice: 1150,
      isWholesale: false,
      minimumOrderQty: 1,
      refurbishedInspected: true,
      warrantyDays: 365,
      notes: 'Flawless condition, battery cycles < 45, Apple charger included.',
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  ];
}

function getDefaultProviderApplications(): ProviderApplication[] {
  return [
    {
      id: 'app-001',
      userId: 'applicant-01',
      applicationType: 'repair_pro',
      businessName: 'Apex Micro-Soldering & Labs Ltd.',
      registrationNumber: 'BC12849021',
      categories: ['smartphone', 'laptop', 'gaming'],
      serviceArea: 'Metro Vancouver & Fraser Valley',
      documentationUrls: ['https://ecoloop.org/docs/license-apex.pdf'],
      status: 'submitted',
      submittedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'app-002',
      userId: 'applicant-02',
      applicationType: 'recycler',
      businessName: 'Cascadia E-Waste Recovery Cooperative',
      registrationNumber: 'CA-EWASTE-9921',
      categories: ['laptop', 'desktop', 'server', 'battery'],
      serviceArea: 'British Columbia Southwest Zone',
      documentationUrls: ['https://ecoloop.org/docs/r2-cert-cascadia.pdf'],
      status: 'under_review',
      reviewerNotes: 'R2v3 certificate verification currently in progress with Canadian recycling council.',
      submittedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];
}

function getDefaultPassportEvents(): DevicePassportEvent[] {
  return [
    {
      id: 'pass-evt-001',
      deviceIdentifier: 'IMEI-358921094819201',
      eventType: 'first_listed',
      actorId: 'usr-01',
      actorRole: 'consumer',
      actorName: 'Original Owner',
      verificationTier: 'user_reported',
      summary: 'Device registered into EcoLoop Circular Passport ledger with pristine battery state.',
      metadata: { originalPurchaseYear: 2022, batteryCycleCount: 180 },
      createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    },
    {
      id: 'pass-evt-002',
      deviceIdentifier: 'IMEI-358921094819201',
      eventType: 'verified_repair',
      actorId: 'pro-ifix-01',
      actorRole: 'repair_pro',
      actorName: 'Apex Micro-Soldering (Certified Provider)',
      verificationTier: 'evidence_backed',
      summary: 'OEM OLED assembly replacement with serialized display calibration.',
      evidenceUrl: 'https://ecoloop.org/proof/invoice-7721.pdf',
      metadata: { partSerialNumber: 'DS-APL-992-01', warrantyDays: 180 },
      createdAt: new Date(Date.now() - 3600000 * 80).toISOString(),
    },
    {
      id: 'pass-evt-003',
      deviceIdentifier: 'IMEI-358921094819201',
      eventType: 'refurbishment_inspection',
      actorId: 'biz-01',
      actorRole: 'business',
      actorName: 'EcoTech Refurbishers Inc.',
      verificationTier: 'certified',
      summary: 'Passed 32-point comprehensive hardware test suite with Grade A certification.',
      metadata: { cosmeticGrade: 'A', cellularModemPass: true, waterSealTested: true },
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
  ];
}

function getDefaultModerationReports(): ModerationReport[] {
  return [
    {
      id: 'rep-001',
      reporterId: 'usr-alert-01',
      reporterName: 'Jordan Vance',
      targetType: 'listing',
      targetId: 'lst-fraud-01',
      targetTitle: 'iPhone 15 Pro Max 1TB - $150 Only (Urgent)',
      category: 'fraud',
      description: 'Price is drastically below market value and seller is requesting wire transfer outside the platform.',
      evidenceUrls: [],
      status: 'new',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'rep-002',
      reporterId: 'usr-alert-02',
      reporterName: 'Chloe Bennett',
      targetType: 'listing',
      targetId: 'lst-hazard-02',
      targetTitle: 'Swollen Li-Ion battery pack for DIY projects',
      category: 'hazardous_item',
      description: 'Seller is offering physically punctured and expanded battery packs via regular postal shipping.',
      evidenceUrls: [],
      status: 'under_review',
      assignedModeratorId: 'mod-01',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}

function getDefaultAuditLogs(): AuditLogRecord[] {
  return [
    {
      id: 'aud-001',
      actorId: 'sys-admin-01',
      actorName: 'System Administrator',
      actorRole: 'admin',
      action: 'PROVIDER_APPLICATION_APPROVED',
      entityType: 'provider_application',
      entityId: 'app-prior-00',
      details: { businessName: 'Apex Micro-Soldering', roleAssigned: 'repair_pro' },
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'aud-002',
      actorId: 'mod-01',
      actorName: 'Compliance Officer',
      actorRole: 'moderator',
      action: 'LISTING_HIDDEN_SAFETY_VIOLATION',
      entityType: 'device_listing',
      entityId: 'lst-hazard-prev',
      details: { reason: 'Untreated hazardous battery packaging' },
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ];
}

// Reset helper for tests
export function resetTestStorage(): void {
  memoryStore = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SESSION);
      window.localStorage.removeItem(STORAGE_KEYS.PROFILES);
      window.localStorage.removeItem(STORAGE_KEYS.LISTINGS);
      window.localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      window.localStorage.removeItem(STORAGE_KEYS.ORGANIZATIONS);
      window.localStorage.removeItem(STORAGE_KEYS.ROLE_ASSIGNMENTS);
      window.localStorage.removeItem(STORAGE_KEYS.PROVIDER_APPLICATIONS);
      window.localStorage.removeItem(STORAGE_KEYS.PROVIDER_PROFILES);
      window.localStorage.removeItem(STORAGE_KEYS.REPAIR_REQUESTS);
      window.localStorage.removeItem(STORAGE_KEYS.REPAIR_QUOTES);
      window.localStorage.removeItem(STORAGE_KEYS.RECYCLING_REQUESTS);
      window.localStorage.removeItem(STORAGE_KEYS.COLLECTION_EVENTS);
      window.localStorage.removeItem(STORAGE_KEYS.INVENTORY_ITEMS);
      window.localStorage.removeItem(STORAGE_KEYS.OFFERS);
      window.localStorage.removeItem(STORAGE_KEYS.PASSPORT_EVENTS);
      window.localStorage.removeItem(STORAGE_KEYS.MODERATION_REPORTS);
      window.localStorage.removeItem(STORAGE_KEYS.MODERATION_ACTIONS);
      window.localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    } catch {
      // Ignore
    }
  }
}
