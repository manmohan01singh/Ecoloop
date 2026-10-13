import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  signUpUser,
  signInUser,
  signOutUser,
  restoreSession,
  requestPasswordReset,
  updateUserProfile,
  updateUserPassword,
  validateEmail,
  validatePassword,
} from './authService';
import {
  resetTestStorage,
  getStoredSessionUser,
  getActivitiesForRecipient,
} from '../storage/localPersistence';

describe('Authentication System Architecture (Phase 3A)', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('validateEmail validates standard format and rejects invalid addresses', () => {
    assert.strictEqual(validateEmail('alex@ecoloop.org'), true);
    assert.strictEqual(validateEmail('user.name+tag@sub.domain.co'), true);
    assert.strictEqual(validateEmail('invalid-email'), false);
    assert.strictEqual(validateEmail('missing@domain'), false);
    assert.strictEqual(validateEmail('   '), false);
  });

  test('validatePassword requires at least 8 characters and a number or symbol', () => {
    const short = validatePassword('abc1');
    assert.strictEqual(short.valid, false);
    assert.ok(short.reason?.includes('at least 8 characters'));

    const noSymbolOrNumber = validatePassword('abcdefghijk');
    assert.strictEqual(noSymbolOrNumber.valid, false);
    assert.ok(noSymbolOrNumber.reason?.includes('at least one number or special character'));

    const validWithNumber = validatePassword('Password123');
    assert.strictEqual(validWithNumber.valid, true);

    const validWithSymbol = validatePassword('Password!Secure');
    assert.strictEqual(validWithSymbol.valid, true);
  });

  test('signUpUser creates authenticated session and records welcome activity event', async () => {
    const result = await signUpUser({
      email: 'pioneer@ecoloop.ca',
      password: 'EcoLoopPassword2026!',
      displayName: 'Maya Lin',
    });

    assert.strictEqual(result.error, null);
    assert.ok(result.session);
    assert.strictEqual(result.session.user.email, 'pioneer@ecoloop.ca');
    assert.strictEqual(result.session.profile.displayName, 'Maya Lin');
    assert.strictEqual(result.session.profile.role, 'member');
    assert.strictEqual(result.session.profile.karmaPoints, 50, 'Awards 50 welcome EcoKarma points');

    // Verify activity event generated
    const events = getActivitiesForRecipient(result.session.user.id);
    assert.strictEqual(events.length, 1);
    assert.strictEqual(events[0].eventType, 'account_created');
    assert.ok(events[0].title.includes('Welcome'));
  });

  test('signUpUser rejects invalid credentials gracefully with clear error', async () => {
    const invalidEmail = await signUpUser({
      email: 'not-an-email',
      password: 'StrongPassword1!',
      displayName: 'Test User',
    });
    assert.strictEqual(invalidEmail.session, null);
    assert.ok(invalidEmail.error?.includes('valid email'));

    const weakPass = await signUpUser({
      email: 'valid@ecoloop.ca',
      password: 'short',
      displayName: 'Test User',
    });
    assert.strictEqual(weakPass.session, null);
    assert.ok(weakPass.error?.includes('8 characters'));

    const missingName = await signUpUser({
      email: 'valid@ecoloop.ca',
      password: 'StrongPassword1!',
      displayName: '   ',
    });
    assert.strictEqual(missingName.session, null);
    assert.ok(missingName.error?.includes('Display name'));
  });

  test('signInUser and signOutUser transition auth state correctly', async () => {
    // 1. Sign in
    const inResult = await signInUser({
      email: 'resident@vancouver.ca',
      password: 'ValidPassword2026#',
    });
    assert.strictEqual(inResult.error, null);
    assert.ok(inResult.session);

    // Verify session persisted
    const stored = getStoredSessionUser();
    assert.ok(stored);
    assert.strictEqual(stored.user.email, 'resident@vancouver.ca');

    // 2. Sign out
    await signOutUser();
    const afterOut = getStoredSessionUser();
    assert.strictEqual(afterOut, null, 'Stored session must be cleared after signOut');
  });

  test('restoreSession restores persisted user session on startup', async () => {
    await signInUser({
      email: 'persisted@ecoloop.local',
      password: 'SecretPassword99!',
    });

    const restored = await restoreSession();
    assert.ok(restored);
    assert.strictEqual(restored.user.email, 'persisted@ecoloop.local');
  });

  test('requestPasswordReset executes recovery request safely', async () => {
    const res = await requestPasswordReset('recovery@ecoloop.ca');
    assert.strictEqual(res.success, true);
    assert.ok(res.message.includes('recovery@ecoloop.ca'));
  });

  test('updateUserProfile safely updates profile fields without privilege escalation', async () => {
    const signup = await signUpUser({
      email: 'profiletest@ecoloop.ca',
      password: 'Password999!',
      displayName: 'Initial Name',
    });
    assert.ok(signup.session);

    const updated = await updateUserProfile(signup.session.user.id, {
      displayName: 'Updated Display Name',
      bio: 'Lifelong electronics repair advocate',
      city: 'North Vancouver',
    });

    assert.ok(updated);
    assert.strictEqual(updated.displayName, 'Updated Display Name');
    assert.strictEqual(updated.bio, 'Lifelong electronics repair advocate');
    assert.strictEqual(updated.city, 'North Vancouver');
    assert.strictEqual(updated.role, 'member', 'Client cannot elevate role');
  });

  test('updateUserPassword rejects weak passwords and succeeds with valid credentials', async () => {
    const signup = await signUpUser({
      email: 'security@ecoloop.test',
      password: 'InitialPassword1!',
      displayName: 'Security User',
    });
    assert.ok(signup.session);

    // Reject weak password (< 8 chars)
    const weakRes = await updateUserPassword('weak1!');
    assert.strictEqual(weakRes.success, false);
    assert.ok(weakRes.error?.includes('8 characters'));

    // Reject password with no number or symbol
    const noSymRes = await updateUserPassword('LongPasswordWithoutNumbers');
    assert.strictEqual(noSymRes.success, false);
    assert.ok(noSymRes.error?.includes('number or special character'));

    // Accept valid strong password
    const validRes = await updateUserPassword('UpdatedSecu!ityPass99');
    assert.strictEqual(validRes.success, true);

    // Verify security activity notice event recorded in audit ledger
    const events = getActivitiesForRecipient(signup.session.user.id);
    const passNotice = events.find((e) => e.title.includes('Password Updated'));
    assert.ok(passNotice, 'Must record security notice event upon password update');
  });
});
