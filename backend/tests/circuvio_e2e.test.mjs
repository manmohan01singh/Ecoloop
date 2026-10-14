import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Set test environment variables before importing app
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
const testDbFile = path.resolve('./test_circuvio.sqlite');
process.env.DB_STORAGE = testDbFile;
process.env.JWT_SECRET = 'test_circuvio_secret_key_12345';

// Remove old test db file if exists
if (fs.existsSync(testDbFile)) {
  try { fs.unlinkSync(testDbFile); } catch {}
}

const { default: app } = await import('../src/app.js');
const {
  default: sequelize,
  User,
  Provider,
  ProfessionalApplication,
  Post,
  RepairRequest,
  RepairQuote,
  RepairMessage,
  Bookmark,
  Follow
} = await import('../src/models/index.js');

let server;
let baseUrl;

// Helper to make API requests
async function api(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const config = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: json };
}

describe('Circuvio / EcoLoop Comprehensive E2E Verification Suite', () => {
  let regularUserToken;
  let regularUserId;
  let regularUserUsername;

  let moderatorUserToken;
  let moderatorUserId;

  let adminUserToken;
  let adminUserId;

  let providerUserToken;
  let providerUserId;
  let providerRecordId;

  let secondUserToken;
  let secondUserId;
  let secondUsername;

  let customerToken;
  let customerId;
  let repairRequestId;
  let quote1Id;
  let quote2Id;

  let competitorProviderToken;
  let competitorProviderId;
  let competitorRecordId;

  let createdPostId;
  let applicationId;

  before(async () => {
    // Sync SQLite database
    await sequelize.sync({ force: true });

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Seed test users: Admin and Moderator directly in database for testing
    const adminUser = await User.create({
      name: 'System Admin',
      username: 'sysadmin',
      email: 'admin@ecoloop.test',
      password: 'Password123!',
      role: 'admin',
      verificationStatus: 'admin_verified',
    });
    adminUserId = adminUser.id;

    const modUser = await User.create({
      name: 'Content Moderator',
      username: 'moduser',
      email: 'moderator@ecoloop.test',
      password: 'Password123!',
      role: 'moderator',
      verificationStatus: 'admin_verified',
    });
    moderatorUserId = modUser.id;

    // Login admin to get token
    const adminLoginRes = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@ecoloop.test', password: 'Password123!' }
    });
    assert.equal(adminLoginRes.status, 200, 'Admin login should succeed');
    adminUserToken = adminLoginRes.body.data?.token || adminLoginRes.body.data?.tokens?.accessToken;

    // Login moderator to get token
    const modLoginRes = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'moderator@ecoloop.test', password: 'Password123!' }
    });
    assert.equal(modLoginRes.status, 200, 'Moderator login should succeed');
    moderatorUserToken = modLoginRes.body.data?.token || modLoginRes.body.data?.tokens?.accessToken;
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    await sequelize.close();
    if (fs.existsSync(testDbFile)) {
      try { fs.unlinkSync(testDbFile); } catch {}
    }
  });

  // ─────────────────────────────────────────────────────────────
  // 1. PUBLIC SIGNUP SECURITY LOCKDOWN
  // ─────────────────────────────────────────────────────────────
  it('1.1 forces role to "user" even if client explicitly requests role: "admin"', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Hacker Attempt Admin',
        email: 'hacker_admin@test.com',
        password: 'Password123!',
        role: 'admin',
      }
    });
    assert.equal(res.status, 201, 'Registration should succeed');
    assert.equal(res.body.data.user.role, 'user', 'Response role must be strictly "user"');

    const dbUser = await User.findByPk(res.body.data.user.id);
    assert.equal(dbUser.role, 'user', 'Database record role must be strictly "user"');
  });

  it('1.2 forces role to "user" when client requests role: "moderator"', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Hacker Attempt Moderator',
        email: 'hacker_mod@test.com',
        password: 'Password123!',
        role: 'moderator',
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, 'user');
  });

  it('1.3 forces role to "user" when client requests role: "repair_provider"', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Direct Provider Attempt',
        email: 'direct_provider@test.com',
        password: 'Password123!',
        role: 'repair_provider',
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, 'user');
  });

  it('1.4 registers ordinary user and automatically assigns unique username', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Alice Green',
        email: 'alice@test.com',
        password: 'Password123!',
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, 'user');
    assert.ok(res.body.data.user.username, 'User should have an auto-generated username');
    const token = res.body.data?.token || res.body.data?.tokens?.accessToken;
    assert.ok(token, 'Registration should return JWT');

    regularUserToken = token;
    regularUserId = res.body.data.user.id;
    regularUserUsername = res.body.data.user.username;
  });

  it('1.5 prevents role elevation through profile update endpoint', async () => {
    const res = await api('/api/auth/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${regularUserToken}` },
      body: {
        role: 'admin',
        bio: 'Eco-conscious electronics repair enthusiast',
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.role, 'user', 'Role must remain "user"');

    const dbUser = await User.findByPk(regularUserId);
    assert.equal(dbUser.role, 'user');
    assert.equal(dbUser.bio, 'Eco-conscious electronics repair enthusiast');
  });

  // ─────────────────────────────────────────────────────────────
  // 2. ADMIN & MODERATOR ACCESS CONTROL GUARDRAILS
  // ─────────────────────────────────────────────────────────────
  it('2.1 rejects unauthenticated requests to application queue with 401', async () => {
    const res = await api('/api/applications/queue/all');
    assert.equal(res.status, 401);
  });

  it('2.2 rejects ordinary user requesting application queue with 403 Forbidden', async () => {
    const res = await api('/api/applications/queue/all', {
      headers: { Authorization: `Bearer ${regularUserToken}` }
    });
    assert.equal(res.status, 403);
  });

  it('2.3 allows moderator to access application review queue (200)', async () => {
    const res = await api('/api/applications/queue/all', {
      headers: { Authorization: `Bearer ${moderatorUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.items));
  });

  it('2.4 allows admin to access application review queue (200)', async () => {
    const res = await api('/api/applications/queue/all', {
      headers: { Authorization: `Bearer ${adminUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.items));
  });

  it('2.5 prevents moderator from accessing admin-only superuser endpoint with 403', async () => {
    const res = await api('/api/admin/users', {
      headers: { Authorization: `Bearer ${moderatorUserToken}` }
    });
    assert.equal(res.status, 403, 'Moderators must not be able to access superuser admin routes');
  });

  // ─────────────────────────────────────────────────────────────
  // 3. PROFESSIONAL ROLE APPLICATION WORKFLOW & ESCALATION GUARDRAILS
  // ─────────────────────────────────────────────────────────────
  it('3.1 rejects application requesting unauthorized system roles like "admin"', async () => {
    const res = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${regularUserToken}` },
      body: {
        requestedRole: 'admin',
        businessName: 'Fake Admin Org',
        contactPerson: 'Alice',
        contactPhone: '1234567890',
        contactEmail: 'alice@test.com',
        city: 'Bengaluru',
        state: 'Karnataka',
      }
    });
    assert.equal(res.status, 400, 'Requesting admin role must fail');
  });

  it('3.2 allows user to submit application for valid operational role "repair_provider"', async () => {
    const res = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${regularUserToken}` },
      body: {
        requestedRole: 'repair_provider',
        businessName: 'Apex Micro Electronics Workshop',
        contactPerson: 'Alice Green',
        contactPhone: '+91 9876543210',
        contactEmail: 'apex@test.com',
        streetAddress: 'Plot 42 Tech Zone',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        experienceYears: 5,
        specializations: ['Micro-soldering', 'Smartphone display', 'Battery restoration'],
        servicesOffered: ['Board diagnostic', 'Component salvage', 'Data recovery'],
        documents: [{ name: 'Trade License', url: 'https://example.com/license.pdf' }],
        applicantNotes: 'Equipped with Hakko soldering stations and thermal imaging.',
        status: 'pending'
      }
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.status, 'pending');
    assert.equal(res.body.data.requestedRole, 'repair_provider');
    assert.ok(Array.isArray(res.body.data.auditLog));
    applicationId = res.body.data.id;
  });

  it('3.3 applicant can fetch their submitted application', async () => {
    const res = await api('/api/applications/mine', {
      headers: { Authorization: `Bearer ${regularUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, applicationId);
  });

  it('3.4 reviewer moves application to "under_review"', async () => {
    const res = await api(`/api/applications/${applicationId}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'under_review');
    assert.ok(res.body.data.auditLog.some(l => l.action === 'under_review'));
  });

  it('3.5 rejects attempt to reject application without a required rejection reason', async () => {
    const res = await api(`/api/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
      body: {
        rejectionReason: '',
      }
    });
    assert.equal(res.status, 400, 'Rejection reason must be mandatory');
  });

  it('3.6 reviewer requests more information with notes', async () => {
    const res = await api(`/api/applications/${applicationId}/request-info`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
      body: {
        notes: 'Please provide proof of certified ESD bench equipment.'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'information_requested');
    assert.equal(res.body.data.reviewNotes, 'Please provide proof of certified ESD bench equipment.');
  });

  it('3.7 applicant updates application to fulfill requested info', async () => {
    const res = await api(`/api/applications/${applicationId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${regularUserToken}` },
      body: {
        documents: [
          { name: 'Trade License', url: 'https://example.com/license.pdf' },
          { name: 'ESD Certification', url: 'https://example.com/esd.pdf' }
        ],
        applicantNotes: 'Attached ESD verification certificate.',
        status: 'pending'
      }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'pending');
    assert.equal(res.body.data.documents.length, 2);
  });

  it('3.8 reviewer approves application: user promoted to "repair_provider" and Provider record created', async () => {
    const res = await api(`/api/applications/${applicationId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminUserToken}` },
      body: {
        reviewNotes: 'All equipment and trade credentials verified.'
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'approved');
    assert.equal(res.body.userRole, 'repair_provider');

    // Verify user model in DB
    const updatedUser = await User.findByPk(regularUserId);
    assert.equal(updatedUser.role, 'repair_provider', 'User role in DB must be repair_provider');
    assert.equal(updatedUser.verificationStatus, 'admin_verified');

    // Verify Provider model in DB
    const providerRecord = await Provider.findOne({ where: { userId: regularUserId } });
    assert.ok(providerRecord, 'Provider record must be created');
    assert.equal(providerRecord.businessName, 'Apex Micro Electronics Workshop');
    assert.equal(providerRecord.verificationStatus, 'admin_verified');

    providerRecordId = providerRecord.id;
    providerUserId = regularUserId;
    providerUserToken = regularUserToken;
  });

  it('3.9 moderator CANNOT review, approve, reject, or request-info on administrative accounts', async () => {
    // Admin user creates an application
    const adminApp = await ProfessionalApplication.create({
      userId: adminUserId,
      requestedRole: 'repair_provider',
      businessName: 'Admin Repairs LLC',
      contactName: 'Super Admin',
      email: 'admin@test.com',
      status: 'pending',
    });

    // Moderator tries to review -> 403 Forbidden
    const revRes = await api(`/api/applications/${adminApp.id}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
    });
    assert.equal(revRes.status, 403);

    // Moderator tries to approve -> 403 Forbidden
    const appRes = await api(`/api/applications/${adminApp.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
    });
    assert.equal(appRes.status, 403);

    // Moderator tries to reject -> 403 Forbidden
    const rejRes = await api(`/api/applications/${adminApp.id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
      body: { rejectionReason: 'Denied by moderator' },
    });
    assert.equal(rejRes.status, 403);

    // Moderator tries to request info -> 403 Forbidden
    const reqRes = await api(`/api/applications/${adminApp.id}/request-info`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
      body: { notes: 'Need more data' },
    });
    assert.equal(reqRes.status, 403);

    // Clean up test application
    await adminApp.destroy();
  });

  it('3.9b applicant CANNOT review, approve, reject, or request-info on their own application (self-approval blocked)', async () => {
    // Moderator user creates an application
    const modApp = await ProfessionalApplication.create({
      userId: moderatorUserId,
      requestedRole: 'business',
      businessName: 'Mod Circular Enterprise',
      contactName: 'Mod Reviewer',
      email: 'mod_enterprise@test.com',
      status: 'pending',
    });

    // Moderator tries to self-review -> 403 Forbidden
    const revRes = await api(`/api/applications/${modApp.id}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
    });
    assert.equal(revRes.status, 403);
    assert.equal(revRes.body.error.code, 'SELF_REVIEW_FORBIDDEN');

    // Moderator tries to self-approve -> 403 Forbidden
    const appRes = await api(`/api/applications/${modApp.id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
    });
    assert.equal(appRes.status, 403);
    assert.equal(appRes.body.error.code, 'SELF_APPROVAL_FORBIDDEN');

    // Moderator tries to self-reject -> 403 Forbidden
    const rejRes = await api(`/api/applications/${modApp.id}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
      body: { rejectionReason: 'Self reject attempt' },
    });
    assert.equal(rejRes.status, 403);
    assert.equal(rejRes.body.error.code, 'SELF_REJECTION_FORBIDDEN');

    // Moderator tries to self-request-info -> 403 Forbidden
    const reqRes = await api(`/api/applications/${modApp.id}/request-info`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${moderatorUserToken}` },
      body: { notes: 'Need self info' },
    });
    assert.equal(reqRes.status, 403);
    assert.equal(reqRes.body.error.code, 'SELF_ACTION_FORBIDDEN');

    await modApp.destroy();
  });

  it('3.9c user cannot submit an application for a role they already possess', async () => {
    // regularUserId was promoted to repair_provider in 3.8
    const dupRes = await api('/api/applications', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` },
      body: {
        requestedRole: 'repair_provider',
        businessName: 'Duplicate Repair Workshop',
        contactName: 'Already Provider',
        email: 'provider_dup@test.com',
      }
    });
    assert.equal(dupRes.status, 400);
    assert.equal(dupRes.body.error.code, 'ALREADY_HAS_ROLE');
  });

  it('3.10 non-existent or invalid UUID IDs return 404 cleanly across application endpoints', async () => {
    const invalidId = 'not-a-valid-uuid';
    const getRes = await api(`/api/applications/${invalidId}`, {
      headers: { Authorization: `Bearer ${adminUserToken}` }
    });
    assert.equal(getRes.status, 404);

    const revRes = await api(`/api/applications/${invalidId}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminUserToken}` }
    });
    assert.equal(revRes.status, 404);

    const appRes = await api(`/api/applications/${invalidId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminUserToken}` }
    });
    assert.equal(appRes.status, 404);

    const rejRes = await api(`/api/applications/${invalidId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminUserToken}` },
      body: { rejectionReason: 'Test' }
    });
    assert.equal(rejRes.status, 404);

    const reqRes = await api(`/api/applications/${invalidId}/request-info`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminUserToken}` },
      body: { notes: 'Test' }
    });
    assert.equal(reqRes.status, 404);
  });

  it('3.11 unauthorized user cannot view or update another user\'s professional application', async () => {
    // Register second ordinary user
    const regRes = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Bob Observer',
        email: 'bob_observer@test.com',
        password: 'Password123!',
      }
    });
    assert.equal(regRes.status, 201);
    secondUserToken = regRes.body.data?.token || regRes.body.data?.tokens?.accessToken;
    secondUserId = regRes.body.data?.user?.id;
    secondUsername = regRes.body.data?.user?.username;

    // Bob attempts to view Alice's application (applicationId) -> 403 Forbidden
    const getRes = await api(`/api/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    assert.equal(getRes.status, 403, 'User cannot view another applicant\'s submission');
    assert.equal(getRes.body.error?.code, 'FORBIDDEN');

    // Bob attempts to update Alice's application -> 403 Forbidden
    const putRes = await api(`/api/applications/${applicationId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${secondUserToken}` },
      body: { notes: 'Tampering attempt' }
    });
    assert.equal(putRes.status, 403, 'User cannot modify another applicant\'s submission');
    assert.equal(putRes.body.error?.code, 'FORBIDDEN');
  });

  it('3.12 unauthenticated mutation requests are strictly rejected with 401', async () => {
    // Unauthenticated attempt to submit an application
    const appRes = await api('/api/applications', {
      method: 'POST',
      body: { requestedRole: 'repair_provider', businessName: 'Anonymous Workshop' }
    });
    assert.equal(appRes.status, 401);

    // Unauthenticated attempt to create a post
    const postRes = await api('/api/posts', {
      method: 'POST',
      body: { title: 'Unauthenticated post', body: 'Should fail' }
    });
    assert.equal(postRes.status, 401);

    // Unauthenticated attempt to submit repair request
    const repRes = await api('/api/providers/repair/requests', {
      method: 'POST',
      body: { itemName: 'Broken Smartphone', description: 'Cracked glass' }
    });
    assert.equal(repRes.status, 401);
  });

  // ─────────────────────────────────────────────────────────────
  // 4. PUBLIC PROFILE & PRIVACY SANITIZATION
  // ─────────────────────────────────────────────────────────────
  it('4.1 unauthenticated visitor can view public profile of provider by username', async () => {
    const res = await api(`/api/users/profile/${regularUserUsername}`);
    assert.equal(res.status, 200);
    const data = res.body.data;

    assert.equal(data.username, regularUserUsername);
    assert.equal(data.name, 'Alice Green');
    assert.equal(data.role, 'repair_provider');
    assert.ok(data.serviceDetails, 'Service details should be included for verified provider');
    assert.equal(data.serviceDetails.businessName, 'Apex Micro Electronics Workshop');

    // CRITICAL PRIVACY CHECKS: No sensitive personal data exposed!
    assert.equal(data.email, undefined, 'Email must NOT be leaked on public profile');
    assert.equal(data.phone, undefined, 'Phone must NOT be leaked on public profile');
    assert.equal(data.address, undefined, 'Address must NOT be leaked on public profile');
    assert.equal(data.pincode, undefined, 'Pincode must NOT be leaked on public profile');
    assert.equal(data.password, undefined, 'Password must NOT be leaked');
  });

  it('4.2 unauthenticated follow request fails with 401', async () => {
    const res = await api(`/api/users/${regularUserId}/follow`, { method: 'POST' });
    assert.equal(res.status, 401);
  });

  it('4.3 authenticated user can follow another user, incrementing counts', async () => {
    // Register second user
    const regRes = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Bob Builder',
        email: 'bob@test.com',
        password: 'Password123!',
      }
    });
    secondUserToken = regRes.body.data?.token || regRes.body.data?.tokens?.accessToken;
    secondUserId = regRes.body.data.user.id;
    secondUsername = regRes.body.data.user.username;

    const res = await api(`/api/users/${regularUserId}/follow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.isFollowing, true);
    assert.equal(res.body.followerCount, 1);

    // Verify profile shows follower count 1
    const prof = await api(`/api/users/profile/${regularUserUsername}`);
    assert.equal(prof.body.data.stats.followersCount, 1);
  });

  it('4.4 calling follow again unfollows the user (toggle)', async () => {
    const res = await api(`/api/users/${regularUserId}/follow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secondUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.isFollowing, false);
    assert.equal(res.body.followerCount, 0);
  });

  it('4.5 private profile hides posts and replies from third-party visitors', async () => {
    // Set Alice's profile to private
    await User.update({ isPrivate: true }, { where: { id: regularUserId } });

    // Third-party visitor queries Alice's posts
    const postRes = await api(`/api/users/profile/${regularUserUsername}/posts`);
    assert.equal(postRes.status, 200);
    assert.equal(postRes.body.data.isPrivate, true);
    assert.equal(postRes.body.data.items.length, 0);

    // Queries Alice's replies
    const repRes = await api(`/api/users/profile/${regularUserUsername}/replies`);
    assert.equal(repRes.status, 200);
    assert.equal(repRes.body.data.isPrivate, true);
    assert.equal(repRes.body.data.items.length, 0);

    // Revert private setting for subsequent tests
    await User.update({ isPrivate: false }, { where: { id: regularUserId } });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. COMMUNITY POSTS, VALIDATION & BOOKMARKS
  // ─────────────────────────────────────────────────────────────
  it('5.1 unauthenticated visitor can browse community feed', async () => {
    const res = await api('/api/posts');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.items));
  });

  it('5.2 rejects post creation with title exceeding 300 characters', async () => {
    const res = await api('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` },
      body: {
        title: 'A'.repeat(301),
        body: 'Content test',
      }
    });
    assert.equal(res.status, 400);
  });

  it('5.3 authenticated user creates a valid post', async () => {
    const res = await api('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` },
      body: {
        title: 'How to safely desolder SMD capacitors on laptop motherboards',
        body: 'Step 1: Apply low-melt bismuth solder alloy. Step 2: Set hot air station to 280C. Step 3: Clean pads with wick.',
        category: 'repair',
      }
    });
    assert.equal(res.status, 201);
    assert.ok(res.body.data.id);
    assert.equal(res.body.data.author.username, regularUserUsername);
    createdPostId = res.body.data.id;
  });

  it('5.4 toggles bookmark on post', async () => {
    // Bookmark post
    const res1 = await api(`/api/posts/${createdPostId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` }
    });
    assert.equal(res1.status, 200);
    assert.equal(res1.body.isBookmarked, true);

    // Verify it appears in user's bookmarks list
    const listRes = await api('/api/posts/bookmarks/mine', {
      headers: { Authorization: `Bearer ${providerUserToken}` }
    });
    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.data.items.length, 1);
    assert.equal(listRes.body.data.items[0].id, createdPostId);

    // Toggle off bookmark
    const res2 = await api(`/api/posts/${createdPostId}/bookmark`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` }
    });
    assert.equal(res2.status, 200);
    assert.equal(res2.body.isBookmarked, false);
  });

  it('5.5 user posts comment on discussion and it appears in public profile replies', async () => {
    const commentRes = await api(`/api/posts/${createdPostId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secondUserToken}` },
      body: {
        body: 'Excellent guide! Low-melt alloy really helps avoid damaging the solder pads.',
      }
    });
    assert.equal(commentRes.status, 201);
    assert.equal(commentRes.body.data.body, 'Excellent guide! Low-melt alloy really helps avoid damaging the solder pads.');

    // Fetch public profile replies for Bob (secondUsername)
    const repliesRes = await api(`/api/users/profile/${secondUsername}/replies`);
    assert.equal(repliesRes.status, 200);
    assert.equal(repliesRes.body.data.items.length, 1);
    assert.equal(repliesRes.body.data.items[0].body, 'Excellent guide! Low-melt alloy really helps avoid damaging the solder pads.');
    assert.equal(repliesRes.body.data.items[0].post.title, 'How to safely desolder SMD capacitors on laptop motherboards');
  });

  // ─────────────────────────────────────────────────────────────
  // 6. REPAIR QUOTES & IN-REQUEST MESSAGING ISOLATION
  // ─────────────────────────────────────────────────────────────
  it('6.1 creates customer ticket and registers competitor provider', async () => {
    // Register customer
    const custRes = await api('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Device Customer Dave',
        email: 'dave@customer.com',
        password: 'Password123!',
      }
    });
    customerToken = custRes.body.data?.token || custRes.body.data?.tokens?.accessToken;
    customerId = custRes.body.data.user.id;

    // Customer creates a repair request
    const reqRes = await api('/api/providers/repair/requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        itemName: 'ThinkPad T480 - USB-C Charging Port Broken',
        category: 'laptop',
        city: 'Bengaluru',
        description: 'Thunderbolt port sparking, will not charge battery. Needs port replacement.',
      }
    });
    assert.equal(reqRes.status, 201);
    repairRequestId = reqRes.body.data.id;

    // Create competitor verified provider directly in DB
    const compUser = await User.create({
      name: 'Competitor Tech Hub',
      username: 'competitor_hub',
      email: 'competitor@techhub.com',
      password: 'Password123!',
      role: 'repair_provider',
      verificationStatus: 'admin_verified',
    });
    competitorProviderId = compUser.id;

    const compProvider = await Provider.create({
      userId: compUser.id,
      businessName: 'Competitor Tech Hub',
      type: 'repair',
      city: 'Bengaluru',
      verificationStatus: 'admin_verified',
    });
    competitorRecordId = compProvider.id;

    const compLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'competitor@techhub.com', password: 'Password123!' }
    });
    competitorProviderToken = compLogin.body.data?.token || compLogin.body.data?.tokens?.accessToken;
  });

  it('6.2 unverified user cannot submit a professional repair quote', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/quotes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        estimatedPriceMin: 50,
        estimatedPriceMax: 100,
      }
    });
    assert.equal(res.status, 403, 'Ordinary users without active provider profile cannot submit quotes');
  });

  it('6.3 provider 1 (Alice) submits a structured repair quote', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/quotes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` },
      body: {
        inspectionFee: 15,
        estimatedPriceMin: 45,
        estimatedPriceMax: 85,
        partsAssumptions: 'New USB-C receptacle daughterboard',
        estimatedTime: '2 business days',
        warrantyTerms: '60-day replacement warranty',
        notes: 'Will inspect power management controller chip as well.',
      }
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.estimatedPriceMin, 45);
    quote1Id = res.body.data.id;
  });

  it('6.4 provider 2 (Competitor) submits competing quote', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/quotes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${competitorProviderToken}` },
      body: {
        inspectionFee: 0,
        estimatedPriceMin: 60,
        estimatedPriceMax: 110,
        partsAssumptions: 'OEM Type-C connector',
        estimatedTime: '1 business day',
        warrantyTerms: '30-day warranty',
        notes: 'Same-day express repair available.',
      }
    });
    assert.equal(res.status, 201);
    quote2Id = res.body.data.id;
  });

  it('6.5 QUOTE ISOLATION: Provider 1 cannot see Provider 2\'s quote', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/quotes`, {
      headers: { Authorization: `Bearer ${providerUserToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1, 'Provider must only see their own quote');
    assert.equal(res.body.data[0].id, quote1Id);
  });

  it('6.6 QUOTE TRANSPARENCY: Ticket Owner sees both competing quotes for comparison', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/quotes`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 2, 'Ticket owner should see all competing quotes');
  });

  it('6.7 ticket owner accepts Provider 1\'s quote', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/quotes/${quote1Id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.quote.status, 'accepted');
  });

  it('6.8 ticket owner and provider can exchange private in-request messages', async () => {
    // Customer sends message to Provider 1
    const sendRes = await api(`/api/providers/repair/requests/${repairRequestId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        providerId: providerRecordId,
        message: 'Hi Alice, when should I drop off the ThinkPad at your shop?',
      }
    });
    assert.equal(sendRes.status, 201);
    assert.equal(sendRes.body.data.message, 'Hi Alice, when should I drop off the ThinkPad at your shop?');

    // Provider 1 replies
    const replyRes = await api(`/api/providers/repair/requests/${repairRequestId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerUserToken}` },
      body: {
        message: 'Feel free to drop it off anytime between 10am and 6pm tomorrow!',
      }
    });
    assert.equal(replyRes.status, 201);

    // Customer fetches messages thread
    const msgRes = await api(`/api/providers/repair/requests/${repairRequestId}/messages?providerId=${providerRecordId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.equal(msgRes.status, 200);
    assert.equal(msgRes.body.data.length, 2);
  });

  it('6.9 MESSAGE ISOLATION: Unrelated competitor cannot snoop on private message thread', async () => {
    const res = await api(`/api/providers/repair/requests/${repairRequestId}/messages`, {
      headers: { Authorization: `Bearer ${competitorProviderToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 0, 'Competitor must not receive messages between customer and Provider 1');
  });

  it('6.10 unverified repair provider cannot view repair quotes or messages', async () => {
    // Create unverified provider user directly in DB
    const unverifiedUser = await User.create({
      name: 'Unverified Fixer',
      username: 'unverified_fixer',
      email: 'unverified@fixer.com',
      password: 'Password123!',
      role: 'repair_provider',
      verificationStatus: 'pending',
    });
    await Provider.create({
      userId: unverifiedUser.id,
      businessName: 'Unverified Fixer Shop',
      type: 'repair',
      verificationStatus: 'pending',
    });
    const unverifiedLogin = await api('/api/auth/login', {
      method: 'POST',
      body: { email: 'unverified@fixer.com', password: 'Password123!' }
    });
    const unverifiedToken = unverifiedLogin.body.data?.token || unverifiedLogin.body.data?.tokens?.accessToken;

    // Attempt to view quotes
    const quotesRes = await api(`/api/providers/repair/requests/${repairRequestId}/quotes`, {
      headers: { Authorization: `Bearer ${unverifiedToken}` }
    });
    assert.equal(quotesRes.status, 403, 'Unverified provider cannot view quotes');

    // Attempt to view messages
    const msgsRes = await api(`/api/providers/repair/requests/${repairRequestId}/messages`, {
      headers: { Authorization: `Bearer ${unverifiedToken}` }
    });
    assert.equal(msgsRes.status, 403, 'Unverified provider cannot view messages');
  });

  it('6.11 prevents non-owner from accepting quote and prevents accepting on closed request', async () => {
    // Competitor attempts to accept quote -> 403
    const nonOwnerRes = await api(`/api/providers/repair/requests/${repairRequestId}/quotes/${quote2Id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${competitorProviderToken}` }
    });
    assert.equal(nonOwnerRes.status, 403);

    // Update repair request status to completed
    await RepairRequest.update({ status: 'completed' }, { where: { id: repairRequestId } });

    // Customer attempts to accept quote on completed ticket -> 400
    const completedRes = await api(`/api/providers/repair/requests/${repairRequestId}/quotes/${quote2Id}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.equal(completedRes.status, 400);
    assert.equal(completedRes.body.error.code, 'INVALID_STATUS');
  });

  it('6.12 public listings and repair requests include usernames and mask sensitive private data', async () => {
    // Customer creates a listing
    const listRes = await api('/api/listings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'MacBook Pro 2021 M1 for Salvage',
        description: 'Logic board good, shattered screen',
        category: 'electronics',
        condition: 'for_parts',
        quantity: 1,
        unit: 'unit',
        city: 'Metropolis',
        price: 500000,
        isFree: false,
        circularAction: 'salvage',
      }
    });
    assert.equal(listRes.status, 201);
    const listingId = listRes.body.data.id;

    // Public visitor retrieves listings
    const publicList = await api('/api/listings');
    assert.equal(publicList.status, 200);
    const item = publicList.body.data.items.find(i => i.id === listingId);
    assert.ok(item, 'Listing must be present in public list');
    assert.ok(item.user.username, 'Seller username must be present for public profile linking');
    assert.equal(item.user.phone, undefined, 'Seller phone must NOT be exposed in listing query');

    // Public single listing query
    const single = await api(`/api/listings/${listingId}`);
    assert.equal(single.status, 200);
    assert.ok(single.body.data.user.username);
    assert.equal(single.body.data.user.phone, undefined, 'Seller phone must NOT be leaked');
  });
});
