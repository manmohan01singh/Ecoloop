import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEVICE_PRESETS,
  evaluateDeviceTruthReport,
  generateFuturesExchangeOffers,
  calculateBestRecommendation,
  generateProofOfRescue,
  generatePassportHash
} from '../src/services/rescueEngine.js';

test('DEVICE_PRESETS includes realistic models with diagnostics and environmental specs', () => {
  assert.ok(DEVICE_PRESETS.length >= 5, 'Should have at least 5 hardware presets');
  const iphone = DEVICE_PRESETS.find(p => p.id === 'preset-iphone13pro');
  assert.ok(iphone, 'iPhone 13 Pro preset should exist');
  assert.equal(iphone.brand, 'Apple');
  assert.ok(iphone.specs.mfgCarbonKg > 0);
  assert.ok(iphone.specs.metals.copperGrams > 0);
  assert.ok(iphone.defaultDiagnostics.batteryHealth > 0);
});

test('generatePassportHash produces unique, tamper-evident IDs', () => {
  const hash1 = generatePassportHash({ brand: 'Apple', model: 'iPhone 13 Pro', purchaseYear: 2021 });
  const hash2 = generatePassportHash({ brand: 'Samsung', model: 'Galaxy S22', purchaseYear: 2022 });
  assert.match(hash1, /^PASSPORT-EL-[0-9A-F]+-[0-9A-Z]+$/);
  assert.match(hash2, /^PASSPORT-EL-[0-9A-F]+-[0-9A-Z]+$/);
  assert.notEqual(hash1, hash2);
});

test('evaluateDeviceTruthReport classifies truth tiers and calculates evidence confidence', () => {
  const sampleDevice = {
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    category: 'smartphone',
    purchaseYear: 2021,
    originalMSRP: 119900
  };

  // High evidence run with photos and healthy diagnostics
  const reportHigh = evaluateDeviceTruthReport(sampleDevice, {
    batteryHealth: 85,
    screenCondition: 'flawless',
    bodyCondition: 'good',
    isProInspected: true
  }, ['photo1.jpg', 'photo2.jpg']);

  assert.ok(reportHigh.truthConfidencePercent >= 70, `Expected >= 70%, got ${reportHigh.truthConfidencePercent}%`);
  assert.ok(reportHigh.truthTier.includes('Tier A') || reportHigh.truthTier.includes('Tier B'));
  assert.ok(reportHigh.passport.passportId.startsWith('PASSPORT-EL-'));
  assert.equal(reportHigh.automatedChecks.length, 6);

  // Low evidence run (no photos, severe faults)
  const reportLow = evaluateDeviceTruthReport(sampleDevice, {
    batteryHealth: 45,
    screenCondition: 'broken_display',
    bodyCondition: 'bent',
    waterDamage: true
  }, []);

  assert.ok(reportLow.truthConfidencePercent < reportHigh.truthConfidencePercent);
});

test('generateFuturesExchangeOffers produces 5 distinct competing pathways', () => {
  const preset = DEVICE_PRESETS[0];
  const truthReport = evaluateDeviceTruthReport(preset, preset.defaultDiagnostics, ['front.png']);
  const offers = generateFuturesExchangeOffers(truthReport);

  assert.equal(offers.length, 5, 'Must generate exactly 5 distinct futures exchange pathways');

  const keys = offers.map(o => o.key);
  assert.ok(keys.includes('repair_keep'), 'Missing repair & keep pathway');
  assert.ok(keys.includes('sell_as_is'), 'Missing sell as-is pathway');
  assert.ok(keys.includes('repair_resell'), 'Missing repair & resell pathway');
  assert.ok(keys.includes('parts_recovery'), 'Missing parts recovery pathway');
  assert.ok(keys.includes('certified_recycle'), 'Missing certified recycle pathway');

  // Verify financial quotes and environmental metrics are present and non-zero
  for (const offer of offers) {
    assert.ok(offer.provider.name, `Offer ${offer.key} missing provider name`);
    assert.ok(offer.financial.displayAmount, `Offer ${offer.key} missing display amount`);
    assert.ok(offer.environmentalImpact.co2SavedKg > 0, `Offer ${offer.key} missing co2SavedKg`);
    assert.ok(offer.warranty, `Offer ${offer.key} missing warranty`);
    assert.ok(offer.confidenceScore, `Offer ${offer.key} missing confidence disclosure`);
  }
});

test('calculateBestRecommendation dynamically optimizes based on user preference priorities', () => {
  const preset = DEVICE_PRESETS[0];
  const truthReport = evaluateDeviceTruthReport(preset, preset.defaultDiagnostics, ['front.png']);
  const offers = generateFuturesExchangeOffers(truthReport);

  // 1. Money optimizer should prioritize highest monetary return
  const recMoney = calculateBestRecommendation(offers, 'money');
  assert.ok(recMoney.topChoice);
  assert.ok(
    recMoney.topChoice.key === 'repair_resell' || recMoney.topChoice.key === 'sell_as_is',
    `Expected money optimizer to recommend resale or sell as-is, got ${recMoney.topChoice.key}`
  );

  // 2. Convenience optimizer should prioritize fastest turnaround / lowest hassle
  const recConvenience = calculateBestRecommendation(offers, 'convenience');
  assert.equal(recConvenience.topChoice.key, 'sell_as_is', 'Expected convenience optimizer to recommend sell_as_is');

  // 3. Lifespan optimizer should prioritize keeping hardware in use longest
  const recLifespan = calculateBestRecommendation(offers, 'lifespan');
  assert.ok(
    recLifespan.topChoice.key === 'repair_keep' || recLifespan.topChoice.key === 'repair_resell',
    `Expected lifespan optimizer to recommend repair, got ${recLifespan.topChoice.key}`
  );

  // 4. Environment optimizer should prioritize max CO2 / critical metal savings
  const recEnvironment = calculateBestRecommendation(offers, 'environment');
  assert.ok(
    recEnvironment.topChoice.key === 'repair_resell' || recEnvironment.topChoice.key === 'repair_keep',
    `Expected environment optimizer to recommend repair pathways, got ${recEnvironment.topChoice.key}`
  );

  // 5. Balanced optimizer should pick a top composite choice
  const recBalanced = calculateBestRecommendation(offers, 'balanced');
  assert.ok(recBalanced.topChoice);
  assert.ok(recBalanced.runnerUp);
  assert.notEqual(recBalanced.topChoice.key, recBalanced.runnerUp.key);

  // Non-sponsored disclosure check
  assert.ok(recMoney.independentDisclosure.includes('No provider pays for priority placement'));
});

test('generateProofOfRescue generates verifiable shareable rescue report with metrics', () => {
  const preset = DEVICE_PRESETS[0];
  const truthReport = evaluateDeviceTruthReport(preset, preset.defaultDiagnostics, ['front.png']);
  const offers = generateFuturesExchangeOffers(truthReport);
  const chosenOffer = offers.find(o => o.key === 'repair_keep');

  const proof = generateProofOfRescue(chosenOffer, truthReport, {
    serviceType: 'Doorstep Certified Tech Lab',
    scheduledDate: 'Tomorrow 10:00 AM'
  });

  assert.ok(proof.rescueId.startsWith('RESCUE-'));
  assert.equal(proof.status, 'Verified & Executed');
  assert.ok(proof.verifiedMetrics.co2AvoidedKg > 0);
  assert.ok(proof.verifiedMetrics.equivalents.treesEquivalent > 0);
  assert.ok(proof.verificationHash.startsWith('SHA256-VTR-'));
  assert.ok(proof.communityChallenge.challengeName);
});

test('Edge cases: Heavily damaged device gets appropriate futures valuation and recycle option', () => {
  const junkDevice = {
    brand: 'Generic',
    model: 'Broken Phone',
    category: 'smartphone',
    purchaseYear: 2017,
    originalMSRP: 15000,
    isWorking: false
  };

  const junkReport = evaluateDeviceTruthReport(junkDevice, {
    batteryHealth: 20,
    screenCondition: 'broken_display',
    bodyCondition: 'bent',
    waterDamage: true
  });

  const offers = generateFuturesExchangeOffers(junkReport);
  assert.equal(offers.length, 5);

  const recycleOffer = offers.find(o => o.key === 'certified_recycle');
  assert.ok(recycleOffer.financial.amount > 0);
  assert.ok(recycleOffer.financial.karmaPoints > 0);
});

test('Edge cases: completely empty input object does not crash and defaults cleanly', () => {
  const emptyReport = evaluateDeviceTruthReport({}, {}, []);
  assert.ok(emptyReport.truthConfidencePercent >= 0);
  assert.ok(emptyReport.passport.passportId);
  assert.equal(emptyReport.automatedChecks.length, 6);

  const offers = generateFuturesExchangeOffers(emptyReport);
  assert.equal(offers.length, 5);

  const rec = calculateBestRecommendation(offers, 'balanced');
  assert.ok(rec.topChoice);
});

test('Edge cases: Laptop category handles heavier mass and higher carbon baseline', () => {
  const laptopPreset = DEVICE_PRESETS.find(p => p.category === 'laptop');
  const report = evaluateDeviceTruthReport(laptopPreset, laptopPreset.defaultDiagnostics, []);
  const offers = generateFuturesExchangeOffers(report);
  
  const repairOffer = offers.find(o => o.key === 'repair_keep');
  // Laptop carbon saved should be significantly higher than a phone (~100kg+ vs ~50kg)
  assert.ok(repairOffer.environmentalImpact.co2SavedKg > 90, `Expected > 90kg CO2, got ${repairOffer.environmentalImpact.co2SavedKg}`);
});

test('Robustness: null and undefined inputs across all service functions do not throw', () => {
  assert.doesNotThrow(() => evaluateDeviceTruthReport(null, null, null));
  assert.doesNotThrow(() => generateFuturesExchangeOffers(null));
  assert.doesNotThrow(() => calculateBestRecommendation(null));
  assert.doesNotThrow(() => calculateBestRecommendation([]));
  assert.doesNotThrow(() => generateProofOfRescue(null, null, null));
  assert.doesNotThrow(() => generatePassportHash(null));

  const nullOffers = generateFuturesExchangeOffers(null);
  assert.deepEqual(nullOffers, []);

  const nullRec = calculateBestRecommendation(null);
  assert.equal(nullRec, null);

  const emptyRec = calculateBestRecommendation([]);
  assert.equal(emptyRec, null);
});

test('Economics: Repair & Resell accurately flags negative arbitrage on heavily damaged devices', () => {
  const totaledPhone = {
    brand: 'Apple',
    model: 'iPhone X',
    category: 'smartphone',
    purchaseYear: 2017,
    originalMSRP: 99000,
    isWorking: false
  };

  const report = evaluateDeviceTruthReport(totaledPhone, {
    batteryHealth: 40,
    screenCondition: 'broken_display',
    bodyCondition: 'bent',
    waterDamage: true
  });

  const offers = generateFuturesExchangeOffers(report);
  const resellOffer = offers.find(o => o.key === 'repair_resell');

  assert.ok(resellOffer, 'Repair & Resell offer should be generated');
  assert.equal(resellOffer.isViable, false, 'Should be flagged as not economically viable');
  assert.ok(resellOffer.financial.explanation.includes('Negative Arbitrage'));
});

test('Valuation: Component & Parts harvest values only functional modules on aging devices without inflated quotes', () => {
  const agedBrokenPhone = {
    brand: 'Apple',
    model: 'iPhone X',
    category: 'smartphone',
    purchaseYear: 2017,
    originalMSRP: 99000,
    isWorking: false
  };

  const report = evaluateDeviceTruthReport(agedBrokenPhone, {
    batteryHealth: 45,
    screenCondition: 'broken_display',
    bodyCondition: 'bent',
    waterDamage: true,
    camerasWorking: false
  });

  const offers = generateFuturesExchangeOffers(report);
  const partsOffer = offers.find(o => o.key === 'parts_recovery');

  assert.ok(partsOffer, 'Parts harvest offer should exist');
  // For a 9-year-old totaled phone with water damage and broken display, payout must be minimal scrap (< ₹1,500), NOT ₹22,000+!
  assert.ok(partsOffer.financial.amount <= 1500, `Expected minimal salvage payout <= 1500, got ₹${partsOffer.financial.amount}`);
});

test('Safety Matrix: Swollen battery triggers critical hazard flag and courier restrictions', () => {
  const dellPreset = DEVICE_PRESETS.find(p => p.id === 'preset-dell-xps');
  const report = evaluateDeviceTruthReport(dellPreset, dellPreset.defaultDiagnostics, []);

  assert.equal(report.hasHazard, true, 'Swollen battery preset must set hasHazard=true');
  assert.ok(report.hazardWarning.includes('CRITICAL SAFETY HAZARD'));
  assert.ok(report.missingDataDisclosures.some(d => d.includes('Swollen battery') || d.includes('Hazmat')));

  const offers = generateFuturesExchangeOffers(report);
  const recycleOffer = offers.find(o => o.key === 'certified_recycle');
  assert.equal(recycleOffer.badge, 'Recommended Safe Destination');
});

test('Honest Replacements: Equivalent replacement cost on older devices scales realistically', () => {
  const phone2017 = {
    brand: 'Samsung',
    model: 'Galaxy S8',
    category: 'smartphone',
    purchaseYear: 2017,
    originalMSRP: 57900
  };

  const report = evaluateDeviceTruthReport(phone2017, {
    batteryHealth: 65,
    screenCondition: 'scratched'
  });

  const offers = generateFuturesExchangeOffers(report);
  const repairOffer = offers.find(o => o.key === 'repair_keep');

  // The equivalent replacement cost should be realistic (~₹7,500 - ₹12,000), NOT 85% of 2017 MSRP (₹49,000+)
  assert.ok(
    repairOffer.financial.equivalentReplacementCost < 25000,
    `Expected realistic replacement cost < 25000, got ₹${repairOffer.financial.equivalentReplacementCost}`
  );
});

test('Disclosures: Missing data disclosures are generated when photos or pro checks are absent', () => {
  const reportNoPhotos = evaluateDeviceTruthReport({ brand: 'Google', model: 'Pixel 7' }, {}, []);
  assert.ok(reportNoPhotos.missingDataDisclosures.length >= 2, 'Should disclose missing photos and missing pro inspection');
  assert.ok(reportNoPhotos.missingDataDisclosures.some(d => d.includes('photographs')));
});

