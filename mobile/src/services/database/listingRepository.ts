import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';
import {
  saveListing,
  getStoredListings,
  getListingsByOwner,
  saveActivityEvent,
  saveProfile,
  getProfileById,
  DeviceListingRecord,
  UserProfile,
} from '../storage/localPersistence';
import {
  uploadListingPhoto,
  deleteUploadedPhotos,
} from '../storage/storageService';
import { PostFormData, PostSubmissionResult } from '../../features/post/types/post.types';
import { ExploreItem, ExploreCategory } from '../../features/explore/types/explore.types';
import { registerSessionPostedItem } from '../../features/explore/hooks/useExploreData';
import { AuthUser } from '../auth/authService';

const CO2_BENCHMARKS: Record<ExploreCategory, number> = {
  smartphone: 68,
  laptop: 195,
  tablet: 42,
  audio: 24,
  gaming: 35,
  parts: 15,
  wearable: 18,
  other: 30,
  all: 50,
};

export const calculateEstimatedCo2 = (category: ExploreCategory, action: string): number => {
  const base = CO2_BENCHMARKS[category] || 40;
  if (action === 'recycle') return Math.round(base * 0.65);
  if (action === 'repair') return Math.round(base * 1.1);
  return base;
};

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Concurrency guard to prevent duplicate submissions
let activeSubmissionLock = false;

/**
 * Persist device listing into the database layer (Supabase if connected, or durable local storage).
 */
export async function persistDeviceListing(
  formData: PostFormData,
  user: AuthUser,
  profile: UserProfile
): Promise<PostSubmissionResult> {
  if (activeSubmissionLock) {
    return {
      success: false,
      error: 'A listing submission is already in progress. Please wait.',
    };
  }

  activeSubmissionLock = true;
  const uploadedStoragePaths: string[] = [];

  try {
    const co2SavedKg = calculateEstimatedCo2(formData.category, formData.action);
    const parsedPrice = formData.isFree ? 0 : parseFloat(formData.price) || 0;
    const parsedOriginalPrice = parseFloat(formData.originalPrice) || undefined;
    // Standard RFC 4122 UUID strictly matching PostgreSQL UUID column format
    const listingId = generateUUID();

    // 1. Upload photos to configured storage bucket with rollback tracking
    const uploadedPhotos: { storagePath: string; publicUrl: string }[] = [];
    for (let i = 0; i < formData.photos.length; i++) {
      const p = formData.photos[i];
      try {
        const uploadRes = await uploadListingPhoto(user.id, listingId, p.uri, i);
        uploadedPhotos.push(uploadRes);
        uploadedStoragePaths.push(uploadRes.storagePath);
      } catch (uploadErr: any) {
        // Compensating action: clean up any previously uploaded photos in this transaction
        await deleteUploadedPhotos(uploadedStoragePaths);
        return {
          success: false,
          error: `Failed to upload device photo: ${uploadErr?.message || 'Upload error'}`,
        };
      }
    }

    const photoUris = uploadedPhotos.map((p) => p.publicUrl);
    const primaryImage =
      photoUris.length > 0
        ? photoUris[0]
        : 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
    const additionalImages = photoUris.slice(1);

    const descriptionText =
      formData.action === 'repair'
        ? `[Issue: ${formData.issueType || 'Unspecified'}] ${formData.issueDetails || ''}\n\n${formData.description}`
        : formData.action === 'recycle'
        ? `[Reason: ${formData.disposalReason || 'End of life'}] Certificate requested: ${formData.certificateRequested ? 'Yes' : 'No'}.\n\n${formData.description}`
        : formData.description;

    const listingRecord: DeviceListingRecord = {
      id: listingId,
      ownerId: user.id,
      title: formData.title.trim(),
      deviceCategory: formData.category,
      brand: formData.brand.trim() || 'Standard',
      model: formData.model.trim() || 'Standard',
      condition: formData.condition,
      description: descriptionText,
      pathway: formData.action as 'sell' | 'repair' | 'recycle',
      status: 'active',
      price: parsedPrice,
      isFree: formData.isFree || parsedPrice === 0,
      originalPrice: parsedOriginalPrice,
      city: formData.city || 'Metro Vancouver',
      pickupType: formData.pickupType,
      warrantyDays: formData.action === 'sell' ? parseInt(formData.warrantyDays, 10) || undefined : undefined,
      issueType: formData.issueType || undefined,
      issueDetails: formData.issueDetails || undefined,
      disposalReason: formData.disposalReason || undefined,
      certificateRequested: Boolean(formData.certificateRequested),
      co2SavedKg,
      photos: [primaryImage, ...additionalImages],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If Supabase is configured, execute remote queries
    if (isSupabaseConfigured()) {
      try {
        // Insert into device_listings
        const { error: insertError } = await supabase.from('device_listings').insert({
          id: listingRecord.id,
          owner_id: user.id,
          title: listingRecord.title,
          device_category: listingRecord.deviceCategory,
          brand: listingRecord.brand,
          model: listingRecord.model,
          condition: listingRecord.condition,
          description: listingRecord.description,
          pathway: listingRecord.pathway,
          status: 'active',
          price: listingRecord.price,
          is_free: listingRecord.isFree,
          original_price: listingRecord.originalPrice,
          city: listingRecord.city,
          pickup_type: listingRecord.pickupType,
          warranty_days: listingRecord.warrantyDays,
          issue_type: listingRecord.issueType,
          issue_details: listingRecord.issueDetails,
          disposal_reason: listingRecord.disposalReason,
          certificate_requested: listingRecord.certificateRequested,
          co2_saved_kg: listingRecord.co2SavedKg,
        });

        if (insertError) {
          // Compensating action: clean up uploaded photos
          await deleteUploadedPhotos(uploadedStoragePaths);
          throw new Error(insertError.message);
        }

        // Insert photos into listing_photos
        if (uploadedPhotos.length > 0) {
          const photoInserts = uploadedPhotos.map((p, idx) => ({
            listing_id: listingRecord.id,
            storage_path: p.storagePath,
            display_order: idx,
            is_cover: idx === 0,
          }));
          await supabase.from('listing_photos').insert(photoInserts);
        }

        // Insert activity event
        await supabase.from('activity_events').insert({
          recipient_id: user.id,
          actor_id: user.id,
          event_type: 'listing_created',
          entity_type: 'device_listing',
          entity_id: listingRecord.id,
          title: `Device Listed: ${listingRecord.title}`,
          description: `Your ${listingRecord.brand} ${listingRecord.model} is now active in Explore. Estimated CO2 diversion: ${co2SavedKg} kg.`,
          metadata: {
            co2SavedKg,
            pathway: listingRecord.pathway,
            price: listingRecord.price,
          },
        });
      } catch (err: any) {
        // Fall back to local storage if remote fails
        console.warn('Supabase remote insert fallback to local storage:', err?.message);
      }
    }

    // Always ensure durable local persistence as well
    saveListing(listingRecord);

    // Save activity event in local ledger
    saveActivityEvent({
      id: generateUUID(),
      recipientId: user.id,
      actorId: user.id,
      eventType: 'listing_created',
      entityType: 'device_listing',
      entityId: listingRecord.id,
      title: `Device Listed: ${listingRecord.title}`,
      description: `Your ${listingRecord.brand} ${listingRecord.model} is now active in Explore. Estimated CO2 diversion: ${co2SavedKg} kg.`,
      metadata: {
        co2SavedKg,
        pathway: listingRecord.pathway,
        price: listingRecord.price,
      },
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    // Award +50 EcoKarma points & update diverted CO2 in user's profile
    const currentProfile = getProfileById(user.id) || profile;
    const updatedProfile: UserProfile = {
      ...currentProfile,
      karmaPoints: (currentProfile.karmaPoints || 0) + 50,
      co2DivertedKg: Math.round(((currentProfile.co2DivertedKg || 0) + co2SavedKg) * 10) / 10,
    };
    saveProfile(updatedProfile);

    // Build ExploreItem
    const newItem: ExploreItem = {
      id: listingRecord.id,
      title: listingRecord.title,
      category: formData.category,
      categoryLabel: formData.category.toUpperCase(),
      action: formData.action,
      actionLabel:
        formData.action === 'sell'
          ? 'For Resale'
          : formData.action === 'repair'
          ? 'Repair Request'
          : 'Recycle Recovery',
      condition: formData.condition,
      conditionLabel:
        formData.condition === 'like_new'
          ? 'Like New'
          : formData.condition === 'good'
          ? 'Good'
          : formData.condition === 'fair'
          ? 'Fair'
          : 'For Parts / Recovery',
      price: parsedPrice,
      isFree: listingRecord.isFree,
      originalPrice: parsedOriginalPrice,
      city: listingRecord.city,
      distanceKm: 0.5,
      imageUrl: primaryImage,
      additionalImages,
      co2SavedKg,
      warrantyDays: listingRecord.warrantyDays,
      description: listingRecord.description,
      specs: {
        Brand: listingRecord.brand,
        Model: listingRecord.model,
        Condition: formData.condition,
      },
      sellerName: profile.displayName || 'You (Current User)',
      sellerRating: 5.0,
      pickupType: formData.pickupType,
      createdAt: listingRecord.createdAt,
      isDevFixture: false,
    };

    // Update Explore in real-time
    registerSessionPostedItem(newItem);

    return {
      success: true,
      createdId: listingRecord.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to submit device listing.',
    };
  } finally {
    activeSubmissionLock = false;
  }
}

/**
 * Fetch listings by owner ID
 */
export function getUserDeviceListings(ownerId: string): DeviceListingRecord[] {
  return getListingsByOwner(ownerId);
}

/**
 * Fetch all persisted listings
 */
export function getAllDeviceListings(): DeviceListingRecord[] {
  return getStoredListings();
}
