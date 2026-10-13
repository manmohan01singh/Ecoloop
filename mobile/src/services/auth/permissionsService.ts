import {
  UserProfile,
  AppRole,
  WorkspaceKey,
  saveProfile,
  getProfileById,
  saveAuditLog,
} from '../storage/localPersistence';
import { AuthUser } from './authService';

export interface WorkspaceOption {
  key: WorkspaceKey;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  requiresAuth: boolean;
}

export const WORKSPACE_DEFINITIONS: Record<WorkspaceKey, WorkspaceOption> = {
  consumer: {
    key: 'consumer',
    title: 'Consumer Hub',
    subtitle: 'Buy, sell, repair, & recycle your devices',
    icon: 'home',
    requiresAuth: false,
  },
  repair_pro: {
    key: 'repair_pro',
    title: 'Repair Specialist',
    subtitle: 'Manage triage requests, quotes & active repairs',
    icon: 'construct',
    badge: 'PRO',
    requiresAuth: true,
  },
  recycler: {
    key: 'recycler',
    title: 'Certified Recycler',
    subtitle: 'Process e-waste batches & measured scale receipts',
    icon: 'leaf',
    badge: 'VERIFIED',
    requiresAuth: true,
  },
  business: {
    key: 'business',
    title: 'Business & Inventory',
    subtitle: 'Manage refurbished stock, bulk lots & CSV imports',
    icon: 'briefcase',
    badge: 'COMMERCE',
    requiresAuth: true,
  },
  moderator: {
    key: 'moderator',
    title: 'Trust & Moderation',
    subtitle: 'Review safety flags, counterfeit reports & fraud',
    icon: 'shield-checkmark',
    badge: 'STAFF',
    requiresAuth: true,
  },
  admin: {
    key: 'admin',
    title: 'Platform Operations',
    subtitle: 'Review provider applications, audit logs & telemetry',
    icon: 'settings',
    badge: 'OPS',
    requiresAuth: true,
  },
};

/**
 * Resolve all roles active on this profile.
 * Consumers always have 'consumer'. Admin role inherits all subsidiary roles.
 */
export function getUserRoles(profile: UserProfile | null): AppRole[] {
  if (!profile) return ['consumer'];

  const roles = new Set<AppRole>(['consumer']);

  // Check explicit roles array
  if (profile.roles && Array.isArray(profile.roles)) {
    profile.roles.forEach((r) => roles.add(r));
  }

  // Check primary role field
  if (profile.role) {
    if (profile.role === 'admin') {
      roles.add('admin');
      roles.add('moderator');
      roles.add('business');
      roles.add('repair_pro');
      roles.add('recycler');
    } else if (profile.role === 'moderator') {
      roles.add('moderator');
    } else if (profile.role === 'business') {
      roles.add('business');
    } else if (profile.role === 'repair_pro') {
      roles.add('repair_pro');
    } else if (profile.role === 'recycler') {
      roles.add('recycler');
    }
  }

  return Array.from(roles);
}

/**
 * Check if the user has a specific role capability
 */
export function hasRole(profile: UserProfile | null, targetRole: AppRole): boolean {
  if (targetRole === 'consumer') return true;
  if (!profile) return false;
  const roles = getUserRoles(profile);
  return roles.includes(targetRole);
}

/**
 * Get all workspaces the user is authorized to enter
 */
export function getAuthorizedWorkspaces(profile: UserProfile | null): WorkspaceOption[] {
  const roles = getUserRoles(profile);
  return Object.values(WORKSPACE_DEFINITIONS).filter((ws) => {
    if (ws.key === 'consumer') return true;
    return roles.includes(ws.key);
  });
}

/**
 * Switch active workspace for a profile
 */
export function switchActiveWorkspace(
  profile: UserProfile,
  targetWorkspace: WorkspaceKey
): { success: boolean; profile: UserProfile; error?: string } {
  const authorized = getAuthorizedWorkspaces(profile);
  const isAllowed = authorized.some((w) => w.key === targetWorkspace);

  if (!isAllowed) {
    return {
      success: false,
      profile,
      error: `You do not have approved permissions for the ${WORKSPACE_DEFINITIONS[targetWorkspace].title} workspace.`,
    };
  }

  const updated: UserProfile = {
    ...profile,
    activeWorkspace: targetWorkspace,
    updatedAt: new Date().toISOString(),
  };

  saveProfile(updated);
  return { success: true, profile: updated };
}

/**
 * Granular capability checks
 */
export function canQuoteRepairs(profile: UserProfile | null): boolean {
  return hasRole(profile, 'repair_pro');
}

export function canProcessRecycling(profile: UserProfile | null): boolean {
  return hasRole(profile, 'recycler');
}

export function canManageInventory(profile: UserProfile | null): boolean {
  return hasRole(profile, 'business');
}

export function canModerate(profile: UserProfile | null): boolean {
  return hasRole(profile, 'moderator');
}

export function canAdminister(profile: UserProfile | null): boolean {
  return hasRole(profile, 'admin');
}

/**
 * Admin action: Grant or revoke role capability to another user
 */
export function grantUserRole(
  adminProfile: UserProfile,
  targetUserId: string,
  roleToGrant: AppRole
): { success: boolean; error?: string } {
  if (!canAdminister(adminProfile)) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const target = getProfileById(targetUserId);
  if (!target) {
    return { success: false, error: 'Target user not found.' };
  }

  const currentRoles = getUserRoles(target);
  if (!currentRoles.includes(roleToGrant)) {
    const updatedRoles = [...currentRoles, roleToGrant];
    const updatedTarget: UserProfile = {
      ...target,
      roles: updatedRoles,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(updatedTarget);

    saveAuditLog({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actorId: adminProfile.id,
      actorName: adminProfile.displayName,
      actorRole: 'admin',
      action: 'ROLE_CAPABILITY_GRANTED',
      entityType: 'user_profile',
      entityId: targetUserId,
      details: { roleGranted: roleToGrant, targetUser: target.displayName },
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true };
}
