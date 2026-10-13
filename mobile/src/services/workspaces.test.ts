import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  UserProfile,
  resetTestStorage,
  saveProfile,
  getProfileById,
  getStoredListings,
  saveListing,
  saveRecyclingRequest,
} from './storage/localPersistence';
import {
  getUserRoles,
  hasRole,
  getAuthorizedWorkspaces,
  switchActiveWorkspace,
  grantUserRole,
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
  createReport,
  getModerationReports,
  takeModerationAction,
  getPlatformOperationalMetrics,
} from './database/workspaceRepositories';
import {
  evaluateCircularRoutes,
  DecisionInput,
} from '../features/decision/services/decisionEngine';

describe('Multi-Role Identity & Permissions Architecture', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Consumers default to consumer role and cannot enter privileged workspaces without approval', () => {
    const consumerProfile: UserProfile = {
      id: 'usr-regular-01',
      email: 'consumer@ecoloop.test',
      displayName: 'Normal Consumer',
      username: 'consumer_01',
      city: 'Vancouver',
      role: 'member',
      karmaPoints: 50,
      co2DivertedKg: 0,
      preferences: { notifications: true, theme: 'system', emailAlerts: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(consumerProfile);

    const roles = getUserRoles(consumerProfile);
    assert.deepStrictEqual(roles, ['consumer']);
    assert.strictEqual(hasRole(consumerProfile, 'repair_pro'), false);
    assert.strictEqual(hasRole(consumerProfile, 'admin'), false);

    const authorizedWorkspaces = getAuthorizedWorkspaces(consumerProfile);
    assert.strictEqual(authorizedWorkspaces.length, 1);
    assert.strictEqual(authorizedWorkspaces[0].key, 'consumer');

    // Attempting unauthorized switch fails cleanly
    const switchResult = switchActiveWorkspace(consumerProfile, 'repair_pro');
    assert.strictEqual(switchResult.success, false);
    assert.match(switchResult.error || '', /do not have approved permissions/);
  });

  test('Administrators inherit all platform operational capabilities', () => {
    const adminProfile: UserProfile = {
      id: 'adm-01',
      email: 'admin@ecoloop.test',
      displayName: 'Platform Admin',
      username: 'admin_ops',
      city: 'Vancouver',
      role: 'admin',
      karmaPoints: 500,
      co2DivertedKg: 200,
      preferences: { notifications: true, theme: 'dark', emailAlerts: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(adminProfile);

    assert.strictEqual(hasRole(adminProfile, 'admin'), true);
    assert.strictEqual(hasRole(adminProfile, 'moderator'), true);
    assert.strictEqual(hasRole(adminProfile, 'repair_pro'), true);
    assert.strictEqual(hasRole(adminProfile, 'recycler'), true);
    assert.strictEqual(hasRole(adminProfile, 'business'), true);
    assert.strictEqual(hasRole(adminProfile, 'consumer'), true);

    const workspaces = getAuthorizedWorkspaces(adminProfile);
    assert.strictEqual(workspaces.length, 6);

    const switchResult = switchActiveWorkspace(adminProfile, 'admin');
    assert.strictEqual(switchResult.success, true);
    assert.strictEqual(switchResult.profile.activeWorkspace, 'admin');
  });

  test('Admin can grant role capabilities and record audit compliance', () => {
    const admin: UserProfile = {
      id: 'adm-02',
      email: 'lead@ecoloop.test',
      displayName: 'Lead Admin',
      username: 'lead_admin',
      city: 'Vancouver',
      role: 'admin',
      karmaPoints: 100,
      co2DivertedKg: 50,
      preferences: { notifications: true, theme: 'dark', emailAlerts: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const technician: UserProfile = {
      id: 'usr-tech-01',
      email: 'tech@ifix.test',
      displayName: 'Sam Tech',
      username: 'sam_tech',
      city: 'Burnaby',
      role: 'member',
      karmaPoints: 80,
      co2DivertedKg: 10,
      preferences: { notifications: true, theme: 'system', emailAlerts: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(admin);
    saveProfile(technician);

    // Regular user cannot grant roles
    const invalidGrant = grantUserRole(technician, technician.id, 'repair_pro');
    assert.strictEqual(invalidGrant.success, false);

    // Admin grants role
    const validGrant = grantUserRole(admin, technician.id, 'repair_pro');
    assert.strictEqual(validGrant.success, true);

    const updatedTech = getProfileById(technician.id);
    assert.ok(updatedTech);
    assert.strictEqual(hasRole(updatedTech, 'repair_pro'), true);
  });
});

describe('Provider Applications & Verification Lifecycle', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Submitting provider application validates required fields and sets status to submitted', () => {
    const submitResult = submitProviderApplication({
      userId: 'usr-applicant-01',
      applicationType: 'repair_pro',
      businessName: 'Metro Soldering Labs',
      registrationNumber: 'BC-992144',
      categories: ['smartphone', 'laptop'],
      serviceArea: 'Greater Vancouver',
    });

    assert.strictEqual(submitResult.success, true);
    assert.ok(submitResult.application);
    assert.strictEqual(submitResult.application.status, 'submitted');
    assert.strictEqual(submitResult.application.businessName, 'Metro Soldering Labs');

    // Missing business name fails
    const failResult = submitProviderApplication({
      userId: 'usr-applicant-02',
      applicationType: 'repair_pro',
      businessName: '',
      registrationNumber: 'BC-1111',
      categories: ['smartphone'],
      serviceArea: 'Vancouver',
    });
    assert.strictEqual(failResult.success, false);
  });

  test('Admin review approval grants role capability automatically', () => {
    const admin: UserProfile = {
      id: 'adm-03',
      email: 'ops@ecoloop.test',
      displayName: 'Ops Admin',
      username: 'ops_admin',
      city: 'Vancouver',
      role: 'admin',
      karmaPoints: 200,
      co2DivertedKg: 100,
      preferences: { notifications: true, theme: 'system', emailAlerts: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const applicant: UserProfile = {
      id: 'applicant-user-01',
      email: 'recycler@greencity.test',
      displayName: 'Green City Recovery',
      username: 'greencity',
      city: 'Richmond',
      role: 'member',
      karmaPoints: 60,
      co2DivertedKg: 5,
      preferences: { notifications: true, theme: 'system', emailAlerts: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(admin);
    saveProfile(applicant);

    const appRes = submitProviderApplication({
      userId: applicant.id,
      applicationType: 'recycler',
      businessName: 'Green City E-Waste Ltd.',
      registrationNumber: 'ENV-BC-8821',
      categories: ['laptop', 'battery'],
      serviceArea: 'Richmond',
    });
    assert.strictEqual(appRes.success, true);

    // Admin approves
    const reviewRes = reviewProviderApplication(admin, appRes.application!.id, 'approved', 'Verified license against ministry registry.');
    assert.strictEqual(reviewRes.success, true);
    assert.strictEqual(reviewRes.application?.status, 'approved');

    // Applicant should now possess recycler capability
    const updatedApplicant = getProfileById(applicant.id);
    assert.ok(updatedApplicant);
    assert.strictEqual(hasRole(updatedApplicant, 'recycler'), true);
  });
});

describe('Repair Professional Workflow & Itemized Quoting', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Repair lifecycle: Submit -> Itemized Quote -> Acceptance -> In-Progress -> Complete', () => {
    // 1. Customer creates request
    const reqRes = createRepairRequest({
      customerId: 'cust-01',
      customerName: 'Diana Prince',
      deviceCategory: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 14',
      issueType: 'Cracked Screen',
      symptoms: 'Glass shattered after fall. Face ID still works.',
    });
    assert.strictEqual(reqRes.success, true);
    const reqId = reqRes.request!.id;
    assert.strictEqual(reqRes.request!.status, 'submitted');

    // 2. Pro prepares itemized quote
    const quoteRes = submitRepairQuote({
      repairRequestId: reqId,
      providerId: 'pro-ifix-01',
      providerName: 'Apex Micro-Soldering',
      partsCost: 90,
      laborCost: 60,
      diagnosticFee: 0,
      estimatedTurnaroundDays: 2,
      warrantyDays: 90,
      notes: 'OEM OLED assembly. 90-day warranty.',
    });
    assert.strictEqual(quoteRes.success, true);
    assert.strictEqual(quoteRes.quote!.totalAmount, 150); // 90 + 60
    assert.strictEqual(quoteRes.quote!.status, 'pending');

    // Request transitions to quoted
    const reqsAfterQuote = getRepairRequests('cust-01');
    assert.strictEqual(reqsAfterQuote.find((r) => r.id === reqId)?.status, 'quoted');

    // 3. Customer accepts quote
    const acceptRes = acceptRepairQuote('cust-01', reqId, quoteRes.quote!.id);
    assert.strictEqual(acceptRes.success, true);
    const quotes = getQuotesForRepairRequest(reqId);
    assert.strictEqual(quotes.find((q) => q.id === quoteRes.quote!.id)?.status, 'accepted');

    // 4. Pro advances status to completed
    const completeRes = updateRepairStatus('pro-ifix-01', reqId, 'completed', 'Installed new OLED panel and recalibrated ambient sensor.');
    assert.strictEqual(completeRes.success, true);

    const completedReq = getRepairRequests('cust-01').find((r) => r.id === reqId);
    assert.strictEqual(completedReq?.status, 'completed');

    // Passport event automatically logged
    const passportEvts = getPassportEventsForDevice('Apple-iPhone 14');
    assert.ok(passportEvts.length > 0);
    assert.strictEqual(passportEvts[0].eventType, 'verified_repair');
  });
});

describe('Recycler Workflow & Measured Scale Weights', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Recycling lifecycle: Request -> Accept -> Measured Scale Weight -> Certificate Issuance', () => {
    const userProfile: UserProfile = {
      id: 'cust-recycle-01',
      email: 'recycler-cust@ecoloop.test',
      displayName: 'Eco Citizen',
      username: 'eco_cit',
      city: 'Vancouver',
      role: 'member',
      karmaPoints: 50,
      co2DivertedKg: 10,
      preferences: { notifications: true, theme: 'system', emailAlerts: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(userProfile);

    // 1. Create recycling request
    const recRes = createRecyclingRequest({
      userId: userProfile.id,
      userName: userProfile.displayName,
      deviceCategory: 'laptop',
      brand: 'Lenovo',
      model: 'ThinkPad T480',
      quantity: 2,
      estimatedWeightKg: 3.2,
      hasHazardousBattery: false,
    });
    assert.strictEqual(recRes.success, true);
    const recId = recRes.request!.id;

    // 2. Recycler accepts
    const accRes = acceptRecyclingRequest('rec-coop-01', 'Cascadia Circular Metals', recId);
    assert.strictEqual(accRes.success, true);

    // 3. Recycler records verified measured scale weight & issues official certificate
    const certRes = recordCollectionReceipt({
      requestId: recId,
      recyclerId: 'rec-coop-01',
      recyclerName: 'Cascadia Circular Metals',
      verifiedWeightKg: 3.45,
      processingStage: 'materials_recovered',
      dispositionSummary: 'Hydrometallurgical rare-earth extraction & copper cathode recovery.',
    });
    assert.strictEqual(certRes.success, true);
    assert.ok(certRes.collectionEvent?.certificateNumber.startsWith('ECO-CERT-'));

    // User profile CO2 and EcoKarma updated
    const updatedUser = getProfileById(userProfile.id);
    assert.ok(updatedUser);
    assert.ok(updatedUser.co2DivertedKg > 10);
    assert.ok(updatedUser.karmaPoints > 50);

    // Device passport record verified
    const passportEvts = getPassportEventsForDevice('Lenovo-ThinkPad T480');
    assert.ok(passportEvts.length > 0);
    assert.strictEqual(passportEvts[0].eventType, 'responsibly_processed');
    assert.strictEqual(passportEvts[0].verificationTier, 'certified');
  });
});

describe('Business Inventory & Bulk CSV Importer', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Valid CSV rows are imported and invalid rows return descriptive errors', () => {
    const csvContent = `sku,title,deviceCategory,brand,model,conditionGrade,quantity,unitPrice,isWholesale
IPH-13-128,iPhone 13 128GB Midnight,smartphone,Apple,iPhone 13,A,5,450,true
INVALID-NO-TITLE,,laptop,Dell,XPS 13,A,2,700,false
BAD-GRADE,Galaxy S22 256GB,smartphone,Samsung,S22,InvalidGrade,3,380,false
VALID-LAPTOP,MacBook Air M1 8GB 256GB,laptop,Apple,MacBook Air M1,A+,4,620,true`;

    const importRes = importInventoryFromCsv('biz-owner-01', csvContent);

    assert.strictEqual(importRes.totalRows, 4);
    assert.strictEqual(importRes.successful, 2);
    assert.strictEqual(importRes.failed, 2);

    // Inspect error reports
    assert.strictEqual(importRes.errors[0].row, 3); // row 3 is missing title
    assert.match(importRes.errors[0].error, /Title cannot be empty/);

    assert.strictEqual(importRes.errors[1].row, 4); // row 4 has invalid grade
    assert.match(importRes.errors[1].error, /Invalid condition grade/);

    // Verify successful items persisted
    const bizItems = getInventoryItems('biz-owner-01');
    assert.ok(bizItems.some((i) => i.sku === 'IPH-13-128'));
    assert.ok(bizItems.some((i) => i.sku === 'VALID-LAPTOP'));
  });
});

describe('Circular Decision Engine & Safety Matrix', () => {
  test('Swollen battery triggers critical hazard lockout and forces certified recycling', () => {
    const input: DecisionInput = {
      deviceCategory: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 11',
      ageYears: 4,
      powerState: 'powers_on',
      screenCondition: 'scratched',
      batteryCondition: 'swollen', // DANGEROUS!
      userPriority: 'max_value',
    };

    const decision = evaluateCircularRoutes(input);

    assert.strictEqual(decision.isHazardous, true);
    assert.match(decision.hazardNotice || '', /CRITICAL SAFETY WARNING/);
    assert.strictEqual(decision.primaryRecommendation.route, 'certified_recycle');

    // Repair and resale must be blocked
    const repairOption = decision.availableRoutes.find((r) => r.route === 'repair');
    assert.ok(repairOption);
    assert.strictEqual(repairOption.isHazardBlocked, true);

    const sellOption = decision.availableRoutes.find((r) => r.route === 'sell_as_is');
    assert.ok(sellOption);
    assert.strictEqual(sellOption.isHazardBlocked, true);
  });

  test('Cracked screen on recent smartphone recommends repair to maximize financial return and save CO2', () => {
    const input: DecisionInput = {
      deviceCategory: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      ageYears: 1,
      powerState: 'powers_on',
      screenCondition: 'cracked',
      batteryCondition: 'normal',
      userPriority: 'max_value',
    };

    const decision = evaluateCircularRoutes(input);

    assert.strictEqual(decision.isHazardous, false);
    assert.strictEqual(decision.primaryRecommendation.route, 'repair');
    assert.ok(decision.primaryRecommendation.estimatedFinancialValue > 0);
    assert.ok(decision.carbonDivertedKg > 0);
  });
});

describe('Moderator Workspace & Platform Telemetry', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Moderator action archives reported fraudulent listing and writes audit log', () => {
    const modProfile: UserProfile = {
      id: 'mod-01',
      email: 'mod@ecoloop.test',
      displayName: 'Safety Moderator',
      username: 'mod_safety',
      city: 'Vancouver',
      role: 'moderator',
      karmaPoints: 100,
      co2DivertedKg: 20,
      preferences: { notifications: true, theme: 'dark', emailAlerts: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(modProfile);

    // Create a listing
    saveListing({
      id: 'lst-fraud-99',
      ownerId: 'bad-actor-01',
      title: 'iPhone 15 Pro Max 1TB - Wire transfer only',
      deviceCategory: 'smartphone',
      brand: 'Apple',
      model: 'iPhone 15 Pro Max',
      condition: 'like_new',
      description: 'Send wire transfer to external bank.',
      pathway: 'sell',
      status: 'active',
      price: 150,
      isFree: false,
      city: 'Vancouver',
      pickupType: 'dropoff',
      certificateRequested: false,
      co2SavedKg: 50,
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // File report
    const repRes = createReport({
      reporterId: 'usr-good-01',
      reporterName: 'Vigilant User',
      targetType: 'listing',
      targetId: 'lst-fraud-99',
      targetTitle: 'iPhone 15 Pro Max 1TB',
      category: 'fraud',
      description: 'Obvious scam price requesting external bank wire.',
    });
    assert.strictEqual(repRes.success, true);

    // Moderator takes action to hide content
    const actionRes = takeModerationAction(modProfile, {
      reportId: repRes.report!.id,
      targetType: 'listing',
      targetId: 'lst-fraud-99',
      actionTaken: 'content_hidden',
      justification: 'External payment scam violation.',
    });
    assert.strictEqual(actionRes.success, true);

    // Target listing is archived
    const listings = getStoredListings();
    const targetListing = listings.find((l) => l.id === 'lst-fraud-99');
    assert.strictEqual(targetListing?.status, 'archived');
  });

  test('Platform telemetry aggregates circular metrics truthfully', () => {
    const metrics = getPlatformOperationalMetrics();
    assert.ok(metrics.totalCircularDevices >= 184);
    assert.ok(metrics.totalCo2PreventedKg >= 0);
    assert.ok(metrics.verifiedProvidersCount >= 2);
  });
});

describe('RFC 4180 CSV Importer & Data Feed Robustness', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('RFC 4180 CSV parser handles BOM, CRLF, quoted fields with internal commas, escaped quotes, and trailing empty lines', () => {
    // Windows Excel UTF-8 CSV with BOM, CRLF, commas inside quotes, escaped double quotes, and trailing blank lines
    const bomCsv = '\uFEFFsku,title,deviceCategory,brand,model,conditionGrade,quantity,unitPrice,isWholesale,notes\r\n' +
      'IPH-13-PRO,"iPhone 13 Pro, 256GB, Sierra Blue",smartphone,Apple,iPhone 13 Pro,A+,3,720,true,"Screen in ""Mint"" condition, includes cable, box"\r\n' +
      '\r\n';

    const result = importInventoryFromCsv('biz-owner-02', bomCsv);

    assert.strictEqual(result.totalRows, 1);
    assert.strictEqual(result.successful, 1);
    assert.strictEqual(result.failed, 0);
    assert.strictEqual(result.importedItems.length, 1);

    const imported = result.importedItems[0];
    assert.strictEqual(imported.sku, 'IPH-13-PRO');
    assert.strictEqual(imported.title, 'iPhone 13 Pro, 256GB, Sierra Blue');
    assert.strictEqual(imported.notes, 'Screen in "Mint" condition, includes cable, box');
    assert.strictEqual(imported.unitPrice, 720);
  });

  test('Duplicate SKU in CSV import feed is caught and reported with exact row number', () => {
    const duplicateCsv = `sku,title,deviceCategory,brand,model,conditionGrade,quantity,unitPrice
SKU-DUP-01,First Device,smartphone,Apple,iPhone 12,A,2,350
SKU-DUP-01,Second Device With Duplicate SKU,smartphone,Apple,iPhone 12,A,1,340`;

    const result = importInventoryFromCsv('biz-owner-03', duplicateCsv);

    assert.strictEqual(result.totalRows, 2);
    assert.strictEqual(result.successful, 1);
    assert.strictEqual(result.failed, 1);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0].row, 3);
    assert.match(result.errors[0].error, /Duplicate SKU/);
  });
});

describe('Competitive Repair Quoting & State Transition Safety', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Competing repair quotes are automatically rejected when customer accepts one quote', () => {
    // 1. Customer creates request
    const reqRes = createRepairRequest({
      customerId: 'cust-comp-01',
      customerName: 'Bruce Wayne',
      deviceCategory: 'laptop',
      brand: 'Apple',
      model: 'MacBook Pro 16',
      issueType: 'Battery Degraded',
      symptoms: 'Battery holds charge for only 30 minutes.',
    });
    assert.strictEqual(reqRes.success, true);
    const reqId = reqRes.request!.id;

    // 2. Provider A submits quote
    const quoteA = submitRepairQuote({
      repairRequestId: reqId,
      providerId: 'pro-alpha',
      providerName: 'Alpha Tech Repair',
      partsCost: 120,
      laborCost: 80,
      estimatedTurnaroundDays: 1,
      notes: 'OEM battery replacement.',
    });
    assert.strictEqual(quoteA.success, true);

    // 3. Provider B submits competing quote
    const quoteB = submitRepairQuote({
      repairRequestId: reqId,
      providerId: 'pro-beta',
      providerName: 'Beta Fixers',
      partsCost: 140,
      laborCost: 90,
      estimatedTurnaroundDays: 2,
      notes: 'Third party battery.',
    });
    assert.strictEqual(quoteB.success, true);

    // Both quotes start as pending
    let quotes = getQuotesForRepairRequest(reqId);
    assert.strictEqual(quotes.find((q) => q.id === quoteA.quote!.id)?.status, 'pending');
    assert.strictEqual(quotes.find((q) => q.id === quoteB.quote!.id)?.status, 'pending');

    // 4. Customer accepts Quote A
    const acceptRes = acceptRepairQuote('cust-comp-01', reqId, quoteA.quote!.id);
    assert.strictEqual(acceptRes.success, true);

    // Quote A is accepted; competing Quote B is automatically rejected
    quotes = getQuotesForRepairRequest(reqId);
    assert.strictEqual(quotes.find((q) => q.id === quoteA.quote!.id)?.status, 'accepted');
    assert.strictEqual(quotes.find((q) => q.id === quoteB.quote!.id)?.status, 'rejected');

    // Invalid transition: cannot jump from submitted/quoted to completed without acceptance
    const invalidReq = createRepairRequest({
      customerId: 'cust-comp-02',
      customerName: 'Clark Kent',
      deviceCategory: 'smartphone',
      brand: 'Samsung',
      model: 'Galaxy S23',
      issueType: 'Port',
      symptoms: 'Loose USB port',
    });
    const badTransition = updateRepairStatus('pro-alpha', invalidReq.request!.id, 'completed');
    assert.strictEqual(badTransition.success, false);
    assert.match(badTransition.error || '', /Invalid repair status transition/);
  });
});

describe('Recycling Lifecycle & Idempotency Protection', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Closed recycling request blocks duplicate processing and prevents double-issuing certificates or karma points', () => {
    const userProfile: UserProfile = {
      id: 'cust-safe-recycle',
      email: 'safe@recycle.test',
      displayName: 'Safe Recycler',
      username: 'safe_rec',
      city: 'Vancouver',
      role: 'member',
      karmaPoints: 100,
      co2DivertedKg: 20,
      preferences: { notifications: true, theme: 'system', emailAlerts: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProfile(userProfile);

    const recRes = createRecyclingRequest({
      userId: userProfile.id,
      userName: userProfile.displayName,
      deviceCategory: 'smartphone',
      brand: 'Google',
      model: 'Pixel 5',
      quantity: 1,
      estimatedWeightKg: 0.25,
    });
    assert.strictEqual(recRes.success, true);
    const recId = recRes.request!.id;

    acceptRecyclingRequest('rec-coop-99', 'Cascadia Circular', recId);

    // Initial receipt processing succeeds
    const certRes = recordCollectionReceipt({
      requestId: recId,
      recyclerId: 'rec-coop-99',
      recyclerName: 'Cascadia Circular',
      verifiedWeightKg: 0.28,
      processingStage: 'materials_recovered',
      dispositionSummary: 'Component recycling',
    });
    assert.strictEqual(certRes.success, true);

    const userAfterFirst = getProfileById(userProfile.id);
    const karmaAfterFirst = userAfterFirst!.karmaPoints;

    // Second receipt attempt on same closed request MUST fail
    const dupRes = recordCollectionReceipt({
      requestId: recId,
      recyclerId: 'rec-coop-99',
      recyclerName: 'Cascadia Circular',
      verifiedWeightKg: 0.28,
      processingStage: 'materials_recovered',
      dispositionSummary: 'Duplicate attempt',
    });
    assert.strictEqual(dupRes.success, false);
    assert.match(dupRes.error || '', /already been processed and closed/);

    // Karma points must not have been inflated again
    const userAfterSecond = getProfileById(userProfile.id);
    assert.strictEqual(userAfterSecond!.karmaPoints, karmaAfterFirst);
  });
});

describe('Circular Decision Engine Input Hardening', () => {
  test('Decision Engine handles edge-case numeric inputs and case-insensitive categories safely', () => {
    const inputWithNaN: DecisionInput = {
      deviceCategory: '  SMARTPHONE  ',
      brand: 'Apple',
      model: 'iPhone 12',
      ageYears: NaN, // corrupted or undefined age
      powerState: 'powers_on',
      screenCondition: 'flawless',
      batteryCondition: 'normal',
      userPriority: 'max_value',
    };

    const decision = evaluateCircularRoutes(inputWithNaN);
    assert.strictEqual(decision.isHazardous, false);
    assert.ok(!isNaN(decision.primaryRecommendation.estimatedFinancialValue));
    assert.ok(!isNaN(decision.carbonDivertedKg));
    assert.ok(decision.carbonDivertedKg > 0);

    // Mixed case swollen battery condition
    const swollenInput: DecisionInput = {
      deviceCategory: 'Laptop',
      brand: 'Dell',
      model: 'XPS 13',
      ageYears: 3,
      powerState: 'powers_on',
      screenCondition: 'scratched',
      batteryCondition: '  SWOLLEN  ' as any,
      userPriority: 'max_value',
    };

    const hazardDecision = evaluateCircularRoutes(swollenInput);
    assert.strictEqual(hazardDecision.isHazardous, true);
    assert.strictEqual(hazardDecision.primaryRecommendation.route, 'certified_recycle');
  });
});

describe('Operational Workflow Authorization & Integrity Hardening', () => {
  beforeEach(() => {
    resetTestStorage();
  });

  test('Double quote acceptance and non-pending quote acceptance are blocked', () => {
    const reqRes = createRepairRequest({
      customerId: 'cust-secure-01',
      customerName: 'Diana Prince',
      deviceCategory: 'tablet',
      brand: 'Apple',
      model: 'iPad Pro 11',
      issueType: 'Screen',
      symptoms: 'Flickering display',
    });
    const reqId = reqRes.request!.id;

    const quoteA = submitRepairQuote({
      repairRequestId: reqId,
      providerId: 'pro-alpha',
      providerName: 'Alpha Repairs',
      partsCost: 150,
      laborCost: 80,
      estimatedTurnaroundDays: 2,
      notes: 'OEM screen replacement',
    });

    const quoteB = submitRepairQuote({
      repairRequestId: reqId,
      providerId: 'pro-beta',
      providerName: 'Beta Fixers',
      partsCost: 130,
      laborCost: 90,
      estimatedTurnaroundDays: 3,
      notes: 'Aftermarket screen',
    });

    // 1. First acceptance succeeds
    const firstAccept = acceptRepairQuote('cust-secure-01', reqId, quoteA.quote!.id);
    assert.strictEqual(firstAccept.success, true);

    // 2. Second acceptance attempt on already accepted request MUST fail
    const secondAccept = acceptRepairQuote('cust-secure-01', reqId, quoteB.quote!.id);
    assert.strictEqual(secondAccept.success, false);
    assert.match(secondAccept.error || '', /already "accepted"/);

    // 3. Attempting to accept an already rejected quote MUST fail
    const rejectedAccept = acceptRepairQuote('cust-secure-01', reqId, quoteB.quote!.id);
    assert.strictEqual(rejectedAccept.success, false);
  });

  test('Unauthorized repair specialist cannot update job status belonging to another provider', () => {
    const reqRes = createRepairRequest({
      customerId: 'cust-auth-02',
      customerName: 'Barry Allen',
      deviceCategory: 'smartphone',
      brand: 'Google',
      model: 'Pixel 7',
      issueType: 'Battery',
      symptoms: 'Battery drains fast',
    });
    const reqId = reqRes.request!.id;

    const quote = submitRepairQuote({
      repairRequestId: reqId,
      providerId: 'pro-legit',
      providerName: 'Legit Repairs',
      partsCost: 70,
      laborCost: 50,
      estimatedTurnaroundDays: 1,
      notes: 'New battery',
    });

    acceptRepairQuote('cust-auth-02', reqId, quote.quote!.id);

    // Malicious or mismatched provider 'pro-impostor' tries to mark job in_progress
    const hijackAttempt = updateRepairStatus('pro-impostor', reqId, 'in_progress');
    assert.strictEqual(hijackAttempt.success, false);
    assert.match(hijackAttempt.error || '', /Only the assigned repair specialist/);

    // Authorized provider succeeds
    const legitUpdate = updateRepairStatus('pro-legit', reqId, 'in_progress');
    assert.strictEqual(legitUpdate.success, true);
  });

  test('Cancelled recycling requests and unassigned recyclers cannot record collection receipts', () => {
    const recRes = createRecyclingRequest({
      userId: 'user-rec-99',
      userName: 'Arthur Curry',
      deviceCategory: 'audio',
      brand: 'Sony',
      model: 'WH-1000XM4',
      quantity: 1,
      estimatedWeightKg: 0.3,
    });
    const recId = recRes.request!.id;

    acceptRecyclingRequest('recycler-primary', 'Primary E-Waste', recId);

    // Unassigned recycler attempts to issue receipt
    const rogueReceipt = recordCollectionReceipt({
      requestId: recId,
      recyclerId: 'recycler-unassigned',
      recyclerName: 'Rogue Recycler',
      verifiedWeightKg: 0.3,
      processingStage: 'materials_recovered',
      dispositionSummary: 'Component recycling',
    });
    assert.strictEqual(rogueReceipt.success, false);
    assert.match(rogueReceipt.error || '', /assigned to another certified recycler/);

    // Cancelled request cannot be processed
    const recCancelRes = createRecyclingRequest({
      userId: 'user-rec-100',
      userName: 'Victor Stone',
      deviceCategory: 'wearable',
      brand: 'Apple',
      model: 'Watch Series 6',
      quantity: 1,
      estimatedWeightKg: 0.1,
    });
    const cancelRecId = recCancelRes.request!.id;
    // Simulate cancellation
    const cancelReq = getRecyclingRequests().find((r) => r.id === cancelRecId)!;
    cancelReq.status = 'cancelled';
    saveRecyclingRequest(cancelReq);

    const cancelReceipt = recordCollectionReceipt({
      requestId: cancelRecId,
      recyclerId: 'recycler-primary',
      recyclerName: 'Primary E-Waste',
      verifiedWeightKg: 0.1,
      processingStage: 'dismantled',
      dispositionSummary: 'Scrap',
    });
    assert.strictEqual(cancelReceipt.success, false);
    assert.match(cancelReceipt.error || '', /cancelled recycling request/);
  });
});

