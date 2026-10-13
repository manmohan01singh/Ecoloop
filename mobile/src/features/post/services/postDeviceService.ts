import { PostFormData, PostSubmissionResult } from '../types/post.types';
import {
  persistDeviceListing,
  calculateEstimatedCo2,
} from '../../../services/database/listingRepository';
import { getStoredSessionUser } from '../../../services/storage/localPersistence';
import { AuthUser } from '../../../services/auth/authService';
import { UserProfile } from '../../../services/storage/localPersistence';

export { calculateEstimatedCo2 };

export const submitPostDevice = async (
  formData: PostFormData,
  authUser?: AuthUser | null,
  userProfile?: UserProfile | null
): Promise<PostSubmissionResult> => {
  try {
    // Determine active authenticated user or active session
    let user: AuthUser;
    let profile: UserProfile;

    if (authUser && userProfile) {
      user = authUser;
      profile = userProfile;
    } else {
      const active = getStoredSessionUser();
      if (active) {
        user = active.user;
        profile = active.profile;
      } else {
        return {
          success: false,
          error: 'Authentication is required to post a device. Please sign in or create an account.',
        };
      }
    }

    return await persistDeviceListing(formData, user, profile);
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to submit device listing.',
    };
  }
};
