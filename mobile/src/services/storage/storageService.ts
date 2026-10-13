import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';

export interface StorageUploadResult {
  storagePath: string;
  publicUrl: string;
}

export const LISTING_PHOTOS_BUCKET = 'listing-photos';

/**
 * Validates that the storage path adheres to the Supabase RLS security policy:
 * (storage.foldername(name))[1] = auth.uid()
 */
export function validateStorageOwnershipPath(userId: string, targetPath: string): boolean {
  if (!userId || !targetPath) return false;
  const parts = targetPath.split('/');
  return parts.length >= 2 && parts[0] === userId;
}

/**
 * Converts an ephemeral web blob: URL into a durable base64 data URL
 * so offline web listings do not lose images when document memory clears on refresh.
 */
async function blobToDataUrl(blobUri: string): Promise<string> {
  if (typeof fetch === 'undefined' || !blobUri.startsWith('blob:')) {
    return blobUri;
  }
  try {
    const res = await fetch(blobUri);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve(blobUri);
          }
        };
        reader.onerror = () => resolve(blobUri);
        reader.readAsDataURL(blob);
      } else {
        resolve(blobUri);
      }
    });
  } catch {
    return blobUri;
  }
}

/**
 * Upload an individual listing photo to Supabase Storage bucket.
 * Conforms to RLS policy: uploaded under `auth.uid() / listing_id / filename`.
 */
export async function uploadListingPhoto(
  userId: string,
  listingId: string,
  photoUri: string,
  index: number
): Promise<StorageUploadResult> {
  const filename = `photo_${index}_${Date.now()}.jpg`;
  const storagePath = `${userId}/${listingId}/${filename}`;

  // If Supabase is not configured, preserve local URI (converting ephemeral web blob: URIs to durable data: URLs)
  if (!isSupabaseConfigured()) {
    let durableUri = photoUri;
    if (photoUri.startsWith('blob:')) {
      durableUri = await blobToDataUrl(photoUri);
    }
    return {
      storagePath,
      publicUrl: durableUri,
    };
  }

  try {
    // Attempt fetching blob from URI (works in React Native, Web, and browser environments)
    const response = await fetch(photoUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from(LISTING_PHOTOS_BUCKET)
      .upload(storagePath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload photo ${index + 1}: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from(LISTING_PHOTOS_BUCKET)
      .getPublicUrl(storagePath);

    return {
      storagePath,
      publicUrl: publicData?.publicUrl || photoUri,
    };
  } catch (error: any) {
    if (isSupabaseConfigured()) {
      throw error;
    }
    // Fall back to local reference if upload fails in non-cloud dev environment
    console.warn(`Storage upload fallback for ${storagePath}:`, error?.message);
    return {
      storagePath,
      publicUrl: photoUri,
    };
  }
}

/**
 * Compensating cleanup transaction: remove uploaded photos from storage bucket
 * if subsequent database insertion fails or operation is cancelled.
 */
export async function deleteUploadedPhotos(storagePaths: string[]): Promise<void> {
  if (!isSupabaseConfigured() || storagePaths.length === 0) {
    return;
  }

  try {
    await supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(storagePaths);
  } catch (err: any) {
    console.warn('Failed to clean up aborted storage uploads:', err?.message);
  }
}
