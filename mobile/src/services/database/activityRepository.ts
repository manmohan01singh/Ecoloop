import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';
import {
  ActivityEventRecord,
  getActivitiesForRecipient,
  markActivityRead as markLocalRead,
  markAllActivitiesRead as markLocalAllRead,
} from '../storage/localPersistence';

export interface ActivityFilterCategory {
  id: 'all' | 'listings' | 'account' | 'system';
  label: string;
}

export const ACTIVITY_CATEGORIES: ActivityFilterCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'listings', label: 'Listings' },
  { id: 'account', label: 'Account' },
  { id: 'system', label: 'System' },
];

/**
 * Fetch all activity events for the given recipient, ordered by creation time DESC.
 */
export async function fetchUserActivities(userId: string): Promise<ActivityEventRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row) => ({
          id: row.id,
          recipientId: row.recipient_id,
          actorId: row.actor_id,
          eventType: row.event_type,
          entityType: row.entity_type,
          entityId: row.entity_id,
          title: row.title,
          description: row.description,
          metadata: row.metadata || {},
          readAt: row.read_at,
          createdAt: row.created_at,
        }));
      }
    } catch {
      // Fallback to local
    }
  }

  return getActivitiesForRecipient(userId);
}

/**
 * Mark a single event as read.
 */
export async function markActivityAsRead(activityId: string, userId: string): Promise<void> {
  // Always update locally
  markLocalRead(activityId, userId);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('activity_events')
        .update({ read_at: new Date().toISOString() })
        .eq('id', activityId)
        .eq('recipient_id', userId);
    } catch {
      // Ignore
    }
  }
}

/**
 * Mark all unread events as read for a user.
 */
export async function markAllActivitiesAsRead(userId: string): Promise<void> {
  // Always update locally
  markLocalAllRead(userId);

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('activity_events')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .is('read_at', null);
    } catch {
      // Ignore
    }
  }
}

/**
 * Calculate the count of unread events for the user.
 */
export function getUnreadActivityCount(userId: string): number {
  const events = getActivitiesForRecipient(userId);
  return events.filter((e) => !e.readAt).length;
}
