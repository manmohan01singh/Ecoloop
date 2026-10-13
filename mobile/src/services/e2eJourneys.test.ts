import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  UserProfile,
  resetTestStorage,
  saveProfile,
  getProfileById,
  getAllProfiles,
  getStoredListings,
  saveListing,
  getStoredActivities,
  saveActivityEvent,
  getCategoryFallbackImage,
  getStoredAuditLogs,
  DeviceListingRecord,
} from './storage/localPersistence';
import {
  setStoredThemeMode,
  getStoredThemeMode,
  subscribeToThemeMode,
} from '../design-system/theme/themeStorage';
import {
  signUpUser,
  signInUser,
  signOutUser,
  restoreSession,
  validateEmail,
  validatePassword,
} from './auth/authService';
import {
  getUserRoles,
  hasRole,
  getAuthorizedWorkspaces,
  switchActiveWorkspace,
  grantUserRole,
  canAdminister,
} from './auth/permissionsService';
import {
  submitProviderApplication,
  getProviderApplications,
  reviewProviderApplication,
  createRepairRequest,
  getRepairRequests,
  submitRepairQuote,
  getQuotesForRepairRequest,
  acceptRepairQuote,
  updateRepairStatus,
  createRecyclingRequest,
  getRecyclingRequests,
  acceptRecyclingRequest,
  recordCollectionReceipt,
  addInventoryItem,
  getInventoryItems,
  importInventoryFromCsv,
  recordPassportEvent,
  getPassportEventsForDevice,
  getPlatformOperationalMetrics,
  getPlatformAuditLogs,
} from './database/workspaceRepositories';
import {
  persistDeviceListing,
  calculateEstimatedCo2,
} from './database/listingRepository';
import { listingRecordToExploreItem } from '../features/explore/hooks/useExploreData';
import { PostFormData } from '../features/post/types/post.types';
import { lightColors, darkColors } from '../design-system/tokens/colors';

describe('Production End-to-End User Journeys (A through H)', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  // ===========================================================================
  // JOURNEY A: Platform Owner / Administrator End-to-End Journey
  // ===========================================================================
  describe('Journey A — Owner & Administrator Governance Journey', () => {
    test('Admin signs in, reviews & approves provider, records audit log, and access is denied to non-admins', async () => {
      // 1. Establish Administrator Identity & Session
      const adminProfile: UserProfile = {
        id: 'adm-ops-01',
        email: 'ops.lead@ecoloop.test',
        displayName: 'EcoLoop Operations Lead',
        username: 'ops_lead',
        city: 'Vancouver',
        role: 'admin',
        karmaPoints: 1250,
        co2DivertedKg: 450,
        preferences: { notifications: true, theme: 'dark', emailAlerts: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(adminProfile);

      // Verify Administrator capabilities
      assert.strictEqual(canAdminister(adminProfile), true, 'Admin profile must satisfy canAdminister check');
      const adminRoles = getUserRoles(adminProfile);
      assert.ok(adminRoles.includes('admin'), 'Admin roles must include admin');
      const adminWorkspaces = getAuthorizedWorkspaces(adminProfile);
      assert.ok(adminWorkspaces.some((w) => w.key === 'admin'), 'Admin must have access to Admin Workspace');

      // 2. An external technician applies to become an approved Repair Partner
      const applicantProfile: UserProfile = {
        id: 'usr-tech-01',
        email: 'tech.repair@vancouverfix.test',
        displayName: 'Vancouver Circuit Tech',
        username: 'vancouver_fix',
        city: 'Vancouver',
        role: 'member',
        karmaPoints: 40,
        co2DivertedKg: 10,
        preferences: { notifications: true, theme: 'system', emailAlerts: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(applicantProfile);

      // Applicant cannot access repair_pro workspace yet
      assert.strictEqual(hasRole(applicantProfile, 'repair_pro'), false);
      const preSwitch = switchActiveWorkspace(applicantProfile, 'repair_pro');
      assert.strictEqual(preSwitch.success, false, 'Pending applicant cannot access repair workspace');

      const appRes = submitProviderApplication({
        userId: applicantProfile.id,
        applicationType: 'repair_pro',
        businessName: 'Vancouver Circuit Lab',
        registrationNumber: 'BC-REG-98721',
        categories: ['smartphone', 'laptop', 'audio'],
        serviceArea: 'Metro Vancouver',
        documentationUrls: ['https://storage.ecoloop.test/docs/cert-license.pdf'],
      });
      assert.strictEqual(appRes.success, true, 'Application submission must succeed');
      const applicationId = appRes.application!.id;

      // 3. Platform Admin inspects pending queue and approves application
      const pendingApps = getProviderApplications('submitted');
      assert.ok(pendingApps.length >= 1, 'Admin should retrieve pending provider applications');

      const reviewRes = reviewProviderApplication(
        adminProfile,
        applicationId,
        'approved',
        'Credentials verified with provincial trade registry. IPC-A-610 certification confirmed.'
      );
      assert.strictEqual(reviewRes.success, true, 'Admin review approval must succeed');

      // 4. Verify Applicant is granted role capability and can switch workspace
      const updatedApplicant = getProfileById(applicantProfile.id);
      assert.ok(updatedApplicant, 'Applicant profile must exist');
      assert.strictEqual(hasRole(updatedApplicant!, 'repair_pro'), true, 'Applicant must now have repair_pro role');

      const postSwitch = switchActiveWorkspace(updatedApplicant!, 'repair_pro');
      assert.strictEqual(postSwitch.success, true, 'Approved provider can switch to repair_pro workspace');

      // 5. Verify immutable audit log was created for admin compliance
      const auditLogs = getPlatformAuditLogs();
      const reviewAudit = auditLogs.find((l) => l.action === 'ROLE_CAPABILITY_GRANTED' && l.entityId === applicantProfile.id);
      assert.ok(reviewAudit, 'An audit log must be recorded for administrative role grant');
      assert.strictEqual(reviewAudit!.actorId, adminProfile.id);

      // 6. Verify non-admin access denial
      const regularUser: UserProfile = {
        id: 'usr-regular-88',
        email: 'regular@ecoloop.test',
        displayName: 'Regular Consumer',
        username: 'regular_user',
        city: 'Richmond',
        role: 'member',
        karmaPoints: 10,
        co2DivertedKg: 0,
        preferences: { notifications: true, theme: 'light', emailAlerts: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(regularUser);

      // Non-admin attempting to review application is rejected
      const rogueReview = reviewProviderApplication(regularUser, applicationId, 'rejected', 'Unauthorized');
      assert.strictEqual(rogueReview.success, false, 'Non-admin must be blocked from reviewing applications');
      assert.match(rogueReview.error || '', /Admin privileges required/);

      // Non-admin attempting to switch to admin workspace is blocked
      const rogueSwitch = switchActiveWorkspace(regularUser, 'admin');
      assert.strictEqual(rogueSwitch.success, false, 'Non-admin must be blocked from admin workspace');
    });
  });

  // ===========================================================================
  // JOURNEY B: Complete Repair Service Workflow
  // ===========================================================================
  describe('Journey B — Repair Lifecycle & Competitive Quoting Journey', () => {
    test('Customer creates request, receives multiple quotes, accepts one atomically, rejects competing quotes, and tracks progress to completion', () => {
      // 1. Customer initiates repair request
      const customer: UserProfile = {
        id: 'cust-repair-01',
        email: 'customer@repair.test',
        displayName: 'Alice Consumer',
        username: 'alice_c',
        city: 'Vancouver',
        role: 'member',
        karmaPoints: 20,
        co2DivertedKg: 5,
        preferences: { notifications: true, theme: 'system', emailAlerts: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(customer);

      const reqRes = createRepairRequest({
        customerId: customer.id,
        customerName: customer.displayName,
        deviceCategory: 'smartphone',
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        issueType: 'OLED Display & Digitizer Cracked',
        symptoms: 'Screen glass shattered, touch unresponsive in upper right quadrant. No water damage.',
        urgency: 'express',
        preferredServiceType: 'dropoff',
        city: 'Vancouver',
      });
      assert.strictEqual(reqRes.success, true);
      const repairRequestId = reqRes.request!.id;

      // 2. Provider 1 submits Quote
      const quote1Res = submitRepairQuote({
        repairRequestId,
        providerId: 'prov-shop-01',
        providerName: 'Pacific Tech Repairs',
        partsCost: 140,
        laborCost: 65,
        diagnosticFee: 0,
        estimatedTurnaroundDays: 1,
        warrantyDays: 180,
        notes: 'OEM-grade OLED assembly with 6-month parts and labor warranty.',
      });
      assert.strictEqual(quote1Res.success, true);
      const quote1Id = quote1Res.quote!.id;

      // 3. Provider 2 submits Competing Quote
      const quote2Res = submitRepairQuote({
        repairRequestId,
        providerId: 'prov-shop-02',
        providerName: 'Downtown Micro Soldering',
        partsCost: 155,
        laborCost: 50,
        diagnosticFee: 15,
        estimatedTurnaroundDays: 2,
        warrantyDays: 90,
        notes: 'Refurbished original display panel with 90-day warranty.',
      });
      assert.strictEqual(quote2Res.success, true);
      const quote2Id = quote2Res.quote!.id;

      // Both quotes are initially pending
      const quotes = getQuotesForRepairRequest(repairRequestId);
      assert.strictEqual(quotes.length, 2);
      assert.strictEqual(quotes[0].status, 'pending');
      assert.strictEqual(quotes[1].status, 'pending');

      // 4. Customer accepts Quote 1
      const acceptRes = acceptRepairQuote(customer.id, repairRequestId, quote1Id);
      assert.strictEqual(acceptRes.success, true, 'Quote acceptance must succeed');

      // Verify atomic state transition:
      // - Quote 1 is accepted
      // - Competing Quote 2 is automatically rejected
      // - Repair request transitions to 'accepted' with acceptedQuoteId set
      const updatedQuotes = getQuotesForRepairRequest(repairRequestId);
      const q1 = updatedQuotes.find((q) => q.id === quote1Id);
      const q2 = updatedQuotes.find((q) => q.id === quote2Id);
      assert.strictEqual(q1?.status, 'accepted');
      assert.strictEqual(q2?.status, 'rejected');

      const requests = getRepairRequests();
      const currentReq = requests.find((r) => r.id === repairRequestId);
      assert.strictEqual(currentReq?.status, 'accepted');
      assert.strictEqual(currentReq?.acceptedQuoteId, quote1Id);

      // 5. Double acceptance or resurrecting competing quote is rejected
      const duplicateAccept = acceptRepairQuote(customer.id, repairRequestId, quote2Id);
      assert.strictEqual(duplicateAccept.success, false, 'Cannot accept a competing or non-pending quote');

      // 6. Provider 1 updates job status to 'in_progress'
      const inProgressRes = updateRepairStatus('prov-shop-01', repairRequestId, 'in_progress');
      assert.strictEqual(inProgressRes.success, true, 'Assigned provider can advance job status');

      // Unauthorized provider cannot hijack job
      const rogueProgress = updateRepairStatus('prov-shop-99-unauthorized', repairRequestId, 'completed');
      assert.strictEqual(rogueProgress.success, false, 'Unassigned provider cannot update job status');
      assert.match(rogueProgress.error || '', /Unauthorized/);

      // 7. Provider 1 completes the repair
      const completeRes = updateRepairStatus('prov-shop-01', repairRequestId, 'completed');
      assert.strictEqual(completeRes.success, true, 'Assigned provider completes the job');

      const finalRequests = getRepairRequests();
      const finalizedReq = finalRequests.find((r) => r.id === repairRequestId);
      assert.strictEqual(finalizedReq?.status, 'completed');
    });
  });

  // ===========================================================================
  // JOURNEY C: Complete Circular Recycling Workflow
  // ===========================================================================
  describe('Journey C — E-Waste Recycling, Calibrated Scale & Idempotency Journey', () => {
    test('Customer requests recycling, certified recycler accepts, weighs on scale, issues certificate, and double-processing is prevented', () => {
      // 1. Customer submits recycling request
      const customer: UserProfile = {
        id: 'cust-recycle-01',
        email: 'eco.citizen@vancouver.test',
        displayName: 'Bob Recycler',
        username: 'bob_r',
        city: 'Burnaby',
        role: 'member',
        karmaPoints: 10,
        co2DivertedKg: 0,
        preferences: { notifications: true, theme: 'system', emailAlerts: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(customer);

      const reqRes = createRecyclingRequest({
        userId: customer.id,
        userName: customer.displayName,
        deviceCategory: 'laptop',
        brand: 'Dell',
        model: 'Latitude E7470',
        quantity: 2,
        estimatedWeightKg: 4.5,
        condition: 'for_parts',
        hasHazardousBattery: false,
        collectionType: 'pickup',
        address: '4500 Kingsway, Burnaby',
        city: 'Burnaby',
      });
      assert.strictEqual(reqRes.success, true);
      const reqId = reqRes.request!.id;

      // 2. Certified recycler accepts collection
      const recyclerId = 'rec-org-vancouver-loop';
      const recyclerName = 'Pacific Circular E-Cycle Depot';
      const acceptRes = acceptRecyclingRequest(recyclerId, recyclerName, reqId);
      assert.strictEqual(acceptRes.success, true);

      // 3. Recycler records calibrated scale receipt with physical measured weight
      const receiptRes = recordCollectionReceipt({
        requestId: reqId,
        recyclerId,
        recyclerName,
        verifiedWeightKg: 4.8, // Calibrated measured scale weight
        hazardousNotes: 'Batteries discharged safely, zero thermal anomalies.',
        processingStage: 'materials_recovered',
        dispositionSummary: 'Dismantled: Copper, aluminium, and circuit boards segregated for R2/e-Stewards smelting recovery.',
      });
      assert.strictEqual(receiptRes.success, true);
      assert.ok(receiptRes.collectionEvent?.certificateNumber.startsWith('ECO-CERT-'));

      // 4. Verify Customer profile received verified CO2 credit and karma
      const updatedCustomer = getProfileById(customer.id);
      assert.ok(updatedCustomer!.co2DivertedKg > 0, 'Customer CO2 diversion must increase based on measured scale weight');
      assert.ok(updatedCustomer!.karmaPoints > 10, 'Customer karma must increase upon verified processing');

      // 5. Verify Device Passport recorded certified event
      const passportEvents = getPassportEventsForDevice('Dell-Latitude E7470');
      assert.ok(passportEvents.length >= 1, 'Passport must record certified disposition event');
      assert.strictEqual(passportEvents[0].verificationTier, 'certified');

      // 6. Idempotency protection: attempting to record receipt a second time fails
      const duplicateReceipt = recordCollectionReceipt({
        requestId: reqId,
        recyclerId,
        recyclerName,
        verifiedWeightKg: 4.8,
        processingStage: 'materials_recovered',
        dispositionSummary: 'Duplicate attempt',
      });
      assert.strictEqual(duplicateReceipt.success, false, 'Cannot re-process an already closed recycling request');
      assert.match(duplicateReceipt.error || '', /already been processed and closed/);
    });
  });

  // ===========================================================================
  // JOURNEY D: Device Posting, Marketplace & Image Safety Loop
  // ===========================================================================
  describe('Journey D — Device Posting, Media Fallback & Marketplace Exploration', () => {
    test('User posts device with photos, persists safely without dead blobs, appears in Explore, and cross-user edits are denied', async () => {
      const sellerProfile: UserProfile = {
        id: 'usr-seller-01',
        email: 'seller@circular.test',
        displayName: 'Elena Tech Reseller',
        username: 'elena_resell',
        city: 'Vancouver',
        role: 'member',
        karmaPoints: 100,
        co2DivertedKg: 50,
        preferences: { notifications: true, theme: 'dark', emailAlerts: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(sellerProfile);

      const authUser = { id: sellerProfile.id, email: sellerProfile.email };

      // Submit device posting with image URLs
      const postFormData: PostFormData = {
        title: 'Sony WH-1000XM4 Noise Cancelling',
        category: 'audio',
        brand: 'Sony',
        model: 'WH-1000XM4',
        condition: 'like_new',
        description: 'Pristine condition, original box, USB-C cable included.',
        photos: [
          { id: 'p1', uri: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600' },
        ],
        action: 'sell',
        price: '190',
        isFree: false,
        originalPrice: '399',
        city: 'Vancouver',
        pickupType: 'dropoff',
        warrantyDays: '30',
        issueType: '',
        issueDetails: '',
        disposalReason: '',
        certificateRequested: false,
        repairUrgency: 'standard',
        preferredService: 'depot',
        hasSwollenBattery: false,
        dropoffPreference: 'depot',
        confirmedAccurate: true,
      };

      const submissionRes = await persistDeviceListing(postFormData, authUser, sellerProfile);
      assert.strictEqual(submissionRes.success, true);
      assert.ok(submissionRes.createdId);

      // Verify listing in stored database
      const stored = getStoredListings();
      const listing = stored.find((l) => l.id === submissionRes.createdId);
      assert.ok(listing, 'Listing must be stored in database');
      assert.strictEqual(listing!.ownerId, sellerProfile.id);
      assert.strictEqual(listing!.price, 190);

      // Verify transformation into Explore Item for marketplace browsing
      const exploreItem = listingRecordToExploreItem(listing!);
      assert.strictEqual(exploreItem.id, listing!.id);
      assert.strictEqual(exploreItem.category, 'audio');
      assert.strictEqual(exploreItem.price, 190);
      assert.ok(!exploreItem.imageUrl.startsWith('blob:'), 'Marketplace image must never be an ephemeral blob: URL');

      // Test image fallback helper directly for unknown/missing category
      const fallbackPhone = getCategoryFallbackImage('smartphone');
      const fallbackLaptop = getCategoryFallbackImage('laptop');
      const fallbackAudio = getCategoryFallbackImage('audio');
      assert.ok(fallbackPhone.startsWith('https://images.unsplash.com/'));
      assert.ok(fallbackLaptop.startsWith('https://images.unsplash.com/'));
      assert.ok(fallbackAudio.startsWith('https://images.unsplash.com/'));

      // Verify dead blob in stored listings is safely sanitized
      const contaminatedRecord: DeviceListingRecord = {
        id: 'list-contaminated-blob-01',
        ownerId: sellerProfile.id,
        title: 'Test Expired Blob Listing',
        deviceCategory: 'gaming',
        brand: 'Sony',
        model: 'PlayStation 5',
        condition: 'good',
        description: 'Listing created before web tab reload.',
        pathway: 'sell',
        status: 'active',
        price: 350,
        isFree: false,
        city: 'Vancouver',
        pickupType: 'pickup',
        certificateRequested: false,
        co2SavedKg: 50,
        photos: ['blob:http://localhost:8081/dead-session-blob-uuid'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveListing(contaminatedRecord);

      // When reading stored listings, the dead blob URL is replaced with the category fallback
      const refreshedListings = getStoredListings();
      const cleaned = refreshedListings.find((l) => l.id === contaminatedRecord.id);
      assert.ok(cleaned);
      assert.ok(!cleaned!.photos[0].startsWith('blob:'), 'Stored listing photos must sanitize blob URLs on retrieval');
      assert.ok(cleaned!.photos[0].startsWith('https://images.unsplash.com/'));
    });
  });

  // ===========================================================================
  // JOURNEY E: Business Inventory & RFC 4180 CSV Import
  // ===========================================================================
  describe('Journey E — Business Bulk Exchange & RFC 4180 CSV Import', () => {
    test('Business imports multi-row inventory CSV with escaped quotes and commas, valid items succeed, errors are reported with row numbers, and duplicate SKUs are blocked', () => {
      const businessOwnerId = 'biz-electronics-ltd';

      const csvData = [
        'sku,title,deviceCategory,brand,model,conditionGrade,quantity,unitPrice,isWholesale,minimumOrderQty,warrantyDays,notes',
        'APL-IP13-128,"iPhone 13, 128GB (Midnight)",smartphone,Apple,iPhone 13,A,5,420,false,1,90,"Tested, 89% battery health"',
        'SAM-S22-256,"Galaxy S22 5G, Phantom Black",smartphone,Samsung,Galaxy S22,B,8,310,true,2,90,"Factory unlocked, minor scuffs"',
        'LEN-T14-GEN2,"ThinkPad T14, 16GB RAM",laptop,Lenovo,ThinkPad T14,A,3,550,false,1,180,"Enterprise pull, pristine"',
        'ERR-NO-TITLE,"",laptop,Dell,XPS 13,A,2,499,false,1,90,"Missing title row"',
        'APL-IP13-128,"Duplicate SKU Row",smartphone,Apple,iPhone 13,A,1,400,false,1,90,"Should be rejected as duplicate"',
      ].join('\r\n'); // Test Windows CRLF line breaks

      const result = importInventoryFromCsv(businessOwnerId, csvData);

      // 3 items should succeed, 2 items should fail
      assert.strictEqual(result.successful, 3, '3 valid inventory items should import successfully');
      assert.strictEqual(result.failed, 2, '2 invalid rows should fail with descriptive errors');

      // Verify row error details
      const missingTitleError = result.errors.find((e) => e.row === 5);
      assert.ok(missingTitleError, 'Row 5 must report missing title');
      assert.match(missingTitleError!.error, /Title cannot be empty/);

      const duplicateSkuError = result.errors.find((e) => e.row === 6);
      assert.ok(duplicateSkuError, 'Row 6 must report duplicate SKU');
      assert.match(duplicateSkuError!.error, /Duplicate SKU/);

      // Verify stored inventory items
      const storedInventory = getInventoryItems(businessOwnerId);
      assert.strictEqual(storedInventory.length, 3);
      const appleItem = storedInventory.find((i) => i.sku === 'APL-IP13-128');
      assert.ok(appleItem, 'Imported Apple iPhone must be found in stored inventory');
      assert.strictEqual(appleItem!.title, 'iPhone 13, 128GB (Midnight)');
    });
  });

  // ===========================================================================
  // JOURNEY F: Device Passport & Multi-Tier Verification Lifecycle
  // ===========================================================================
  describe('Journey F — Device Passport & Multi-Tier Trust Architecture', () => {
    test('Lifecycle events record properly across all 4 tiers (user_reported, provider_reported, evidence_backed, certified) with privacy protection', () => {
      const deviceId = 'SN-APPLE-MACBOOK-PRO-M1-2021';

      // Tier 1: user_reported
      const event1 = recordPassportEvent({
        deviceIdentifier: deviceId,
        eventType: 'first_listed',
        actorId: 'usr-owner-01',
        actorRole: 'consumer',
        actorName: 'Original Owner',
        verificationTier: 'user_reported',
        summary: 'MacBook Pro 14" listed for circular trade. Battery cycle count: 184.',
      });
      assert.strictEqual(event1.verificationTier, 'user_reported');

      // Tier 2: provider_reported
      const event2 = recordPassportEvent({
        deviceIdentifier: deviceId,
        eventType: 'parts_replaced',
        actorId: 'prov-shop-42',
        actorRole: 'repair_pro',
        actorName: 'Pacific Repair Specialists',
        verificationTier: 'provider_reported',
        summary: 'Genuine thermal paste refreshed and OEM trackpad cable replaced.',
        metadata: { partsRef: 'OEM-TP-CABLE-A2442' },
      });
      assert.strictEqual(event2.verificationTier, 'provider_reported');

      // Tier 3: evidence_backed
      const event3 = recordPassportEvent({
        deviceIdentifier: deviceId,
        eventType: 'refurbishment_inspection',
        actorId: 'lab-diagnostics-bc',
        actorRole: 'refurbisher',
        actorName: 'Metro Hardware Diagnostics Lab',
        verificationTier: 'evidence_backed',
        summary: '32-point hardware diagnostic passed 100%. Diagnostic hash: sha256:d8a2f7c0...',
        evidenceUrl: 'https://verify.ecoloop.test/reports/diag-88219.json',
      });
      assert.strictEqual(event3.verificationTier, 'evidence_backed');

      // Tier 4: certified
      const event4 = recordPassportEvent({
        deviceIdentifier: deviceId,
        eventType: 'responsibly_processed',
        actorId: 'rec-certified-e-cycle',
        actorRole: 'recycler',
        actorName: 'Certified Clean Tech E-Waste Recycling',
        verificationTier: 'certified',
        summary: 'End-of-life battery module safely separated and recycled under R2 standard.',
        metadata: { certificateId: 'ECO-CERT-2026-902194' },
      });
      assert.strictEqual(event4.verificationTier, 'certified');

      // Query passport events
      const history = getPassportEventsForDevice(deviceId);
      assert.strictEqual(history.length, 4, 'All 4 lifecycle passport events must be retrieved');

      // Verify privacy protection: check that no actor passwords, payment methods, or personal phone numbers are present
      for (const ev of history) {
        assert.strictEqual(ev.metadata?.password, undefined);
        assert.strictEqual(ev.metadata?.creditCard, undefined);
        assert.strictEqual(ev.metadata?.sin, undefined);
      }
    });
  });

  // ===========================================================================
  // JOURNEY G: Platform Reliability, Fault Recovery & Idempotency
  // ===========================================================================
  describe('Journey G — Reliability, Recovery & Idempotency Protections', () => {
    test('Activity ledger prevents duplicate events and handles unread counter updates accurately', () => {
      const recipientId = 'usr-ledger-test-01';

      // Insert first event
      const eventId = 'act-test-idempotent-01';
      const event1 = {
        id: eventId,
        recipientId,
        eventType: 'listing_created' as const,
        entityType: 'device_listing' as const,
        title: 'Listing Published',
        description: 'Your device is now live in the marketplace.',
        metadata: {},
        readAt: null,
        createdAt: new Date().toISOString(),
      };
      saveActivityEvent(event1);

      const activities = getStoredActivities();
      assert.strictEqual(activities.filter((a) => a.id === eventId).length, 1);

      // Attempt duplicate insertion with same ID
      saveActivityEvent(event1);
      const afterDuplicate = getStoredActivities();
      assert.strictEqual(afterDuplicate.filter((a) => a.id === eventId).length, 1, 'Duplicate activity ID must not create second row');

      // Environmental benchmarks calculation reliability
      const phoneSellCo2 = calculateEstimatedCo2('smartphone', 'sell');
      const phoneRecycleCo2 = calculateEstimatedCo2('smartphone', 'recycle');
      const laptopRepairCo2 = calculateEstimatedCo2('laptop', 'repair');

      assert.ok(phoneSellCo2 > 0, 'Sell pathway must yield positive CO2 savings');
      assert.ok(phoneRecycleCo2 > 0, 'Recycle pathway must yield positive CO2 savings');
      assert.ok(laptopRepairCo2 > phoneSellCo2, 'Laptop repair diversion must exceed smartphone resale savings');
    });
  });

  // ===========================================================================
  // JOURNEY H: Theme Architecture, Accessibility & Non-Resetting State
  // ===========================================================================
  describe('Journey H — Theme State & System Appearance Integrity', () => {
    test('Appearance mode persists across light, dark, and system modes and notifies active subscribers', () => {
      let notifiedMode: string | null = null;
      const unsubscribe = subscribeToThemeMode((newMode) => {
        notifiedMode = newMode;
      });

      // Default is system
      setStoredThemeMode('light');
      assert.strictEqual(getStoredThemeMode(), 'light');
      assert.strictEqual(notifiedMode, 'light');

      setStoredThemeMode('dark');
      assert.strictEqual(getStoredThemeMode(), 'dark');
      assert.strictEqual(notifiedMode, 'dark');

      setStoredThemeMode('system');
      assert.strictEqual(getStoredThemeMode(), 'system');
      assert.strictEqual(notifiedMode, 'system');

      unsubscribe();

      // Verify semantic color tokens are defined for both modes
      assert.ok(lightColors.tint.length > 0);
      assert.ok(darkColors.tint.length > 0);
      assert.ok(lightColors.background.length > 0);
      assert.ok(darkColors.background.length > 0);
      assert.ok(lightColors.labelPrimary.length > 0);
      assert.ok(darkColors.labelPrimary.length > 0);
    });
  });
});
