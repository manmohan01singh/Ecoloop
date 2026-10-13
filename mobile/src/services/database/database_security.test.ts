import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  persistDeviceListing,
  getUserDeviceListings,
  calculateEstimatedCo2,
} from './listingRepository';
import {
  fetchUserActivities,
  markActivityAsRead,
  markAllActivitiesAsRead,
  getUnreadActivityCount,
} from './activityRepository';
import {
  resetTestStorage,
  getProfileById,
  saveActivityEvent,
  getActivitiesForRecipient,
} from '../storage/localPersistence';
import { PostFormData } from '../../features/post/types/post.types';
import { AuthUser } from '../auth/authService';
import { UserProfile } from '../storage/localPersistence';

describe('Database Persistence & Security Isolation (Phase 3A)', () => {
  const aliceUser: AuthUser = { id: 'usr-alice-111', email: 'alice@ecoloop.test' };
  const aliceProfile: UserProfile = {
    id: 'usr-alice-111',
    email: 'alice@ecoloop.test',
    displayName: 'Alice Circular',
    username: 'alice_c',
    city: 'Vancouver',
    role: 'member',
    karmaPoints: 50,
    co2DivertedKg: 0,
    preferences: { notifications: true, theme: 'system', emailAlerts: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const bobUser: AuthUser = { id: 'usr-bob-222', email: 'bob@ecoloop.test' };
  const bobProfile: UserProfile = {
    id: 'usr-bob-222',
    email: 'bob@ecoloop.test',
    displayName: 'Bob Recycler',
    username: 'bob_r',
    city: 'Burnaby',
    role: 'member',
    karmaPoints: 50,
    co2DivertedKg: 0,
    preferences: { notifications: true, theme: 'system', emailAlerts: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    resetTestStorage();
  });

  test('persistDeviceListing creates durable record with authenticated owner ID', async () => {
    const postData: PostFormData = {
      photos: [{ id: 'p1', uri: 'https://images.unsplash.com/phone1.jpg', isPrimary: true }],
      title: 'Google Pixel 7 Pro 128GB',
      category: 'smartphone',
      brand: 'Google',
      model: 'Pixel 7 Pro',
      condition: 'good',
      description: 'Used for one year with screen protector.',
      city: 'Metro Vancouver',
      action: 'sell',
      price: '420',
      isFree: false,
      originalPrice: '899',
      pickupType: 'both',
      warrantyDays: '30',
      issueType: '',
      issueDetails: '',
      repairUrgency: 'standard',
      preferredService: 'depot',
      disposalReason: '',
      certificateRequested: false,
      hasSwollenBattery: false,
      dropoffPreference: 'depot',
      confirmedAccurate: true,
    };

    const res = await persistDeviceListing(postData, aliceUser, aliceProfile);
    assert.strictEqual(res.success, true);
    assert.ok(res.createdId);

    // Verify listing persisted under Alice
    const aliceListings = getUserDeviceListings(aliceUser.id);
    assert.strictEqual(aliceListings.length, 1);
    assert.strictEqual(aliceListings[0].id, res.createdId);
    assert.strictEqual(aliceListings[0].ownerId, aliceUser.id);
    assert.strictEqual(aliceListings[0].price, 420);
    assert.strictEqual(aliceListings[0].co2SavedKg, 68);

    // Verify Bob does not own Alice's listing
    const bobListings = getUserDeviceListings(bobUser.id);
    assert.strictEqual(bobListings.length, 0);

    // Verify Alice was awarded +50 EcoKarma points & CO2 was updated
    const updatedAlice = getProfileById(aliceUser.id);
    assert.ok(updatedAlice);
    assert.strictEqual(updatedAlice.karmaPoints, 100);
    assert.strictEqual(updatedAlice.co2DivertedKg, 68);

    // Verify Activity event recorded for Alice
    const aliceActivities = await fetchUserActivities(aliceUser.id);
    assert.strictEqual(aliceActivities.length, 1);
    assert.strictEqual(aliceActivities[0].eventType, 'listing_created');
    assert.ok(aliceActivities[0].title.includes('Google Pixel 7 Pro'));
  });

  test('Activity Isolation: Users only retrieve their own activity ledger', async () => {
    // Generate event for Alice
    saveActivityEvent({
      id: 'act-alice-1',
      recipientId: aliceUser.id,
      eventType: 'karma_earned',
      entityType: 'profile',
      title: 'Alice EcoKarma Bonus',
      description: 'Awarded for dropoff at community hub.',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    // Generate event for Bob
    saveActivityEvent({
      id: 'act-bob-1',
      recipientId: bobUser.id,
      eventType: 'system_notice',
      entityType: 'system',
      title: 'Bob System Welcome',
      description: 'System message for Bob.',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    // Alice should only see her event
    const aliceEvents = await fetchUserActivities(aliceUser.id);
    assert.strictEqual(aliceEvents.length, 1);
    assert.strictEqual(aliceEvents[0].id, 'act-alice-1');

    // Bob should only see his event
    const bobEvents = await fetchUserActivities(bobUser.id);
    assert.strictEqual(bobEvents.length, 1);
    assert.strictEqual(bobEvents[0].id, 'act-bob-1');
  });

  test('markActivityAsRead and markAllActivitiesAsRead update unread counter', async () => {
    saveActivityEvent({
      id: 'act-1',
      recipientId: aliceUser.id,
      eventType: 'listing_created',
      entityType: 'device_listing',
      title: 'Listing 1',
      description: 'Item 1 listed',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    saveActivityEvent({
      id: 'act-2',
      recipientId: aliceUser.id,
      eventType: 'listing_created',
      entityType: 'device_listing',
      title: 'Listing 2',
      description: 'Item 2 listed',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    assert.strictEqual(getUnreadActivityCount(aliceUser.id), 2);

    // Mark single event read
    await markActivityAsRead('act-1', aliceUser.id);
    assert.strictEqual(getUnreadActivityCount(aliceUser.id), 1);

    // Mark remaining all read
    await markAllActivitiesAsRead(aliceUser.id);
    assert.strictEqual(getUnreadActivityCount(aliceUser.id), 0);
  });

  test('Duplicate activity event insertion is cleanly prevented', () => {
    saveActivityEvent({
      id: 'act-unique-100',
      recipientId: aliceUser.id,
      eventType: 'system_notice',
      entityType: 'system',
      title: 'Notice',
      description: 'Important notice',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    // Attempt second save with identical ID
    saveActivityEvent({
      id: 'act-unique-100',
      recipientId: aliceUser.id,
      eventType: 'system_notice',
      entityType: 'system',
      title: 'Notice',
      description: 'Important notice duplicate',
      metadata: {},
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    const events = getActivitiesForRecipient(aliceUser.id);
    assert.strictEqual(events.length, 1, 'Duplicate event must be ignored');
  });

  test('Storage Security: Upload paths strictly enforce user ID prefix ownership', () => {
    const { validateStorageOwnershipPath } = require('../storage/storageService');

    // Alice uploading to her own directory is permitted
    const aliceValidPath = `${aliceUser.id}/listing-123/photo_0.jpg`;
    assert.strictEqual(validateStorageOwnershipPath(aliceUser.id, aliceValidPath), true);

    // Alice attempting to upload to Bob's directory is blocked
    const aliceImpersonatingBob = `${bobUser.id}/listing-123/photo_0.jpg`;
    assert.strictEqual(validateStorageOwnershipPath(aliceUser.id, aliceImpersonatingBob), false);

    // Root-level path without user prefix is blocked
    const unpartitionedPath = `public-photos/device.jpg`;
    assert.strictEqual(validateStorageOwnershipPath(aliceUser.id, unpartitionedPath), false);
  });
});
