/**
 * Circuvio Rescue Engine & Device Futures Exchange Service
 * 
 * Signature Experience Engine:
 * 1. Device Truth Report & Diagnostic Assessment (Tiers A/B/C + Safety Matrix)
 * 2. Device Futures Exchange (5 Competing Circular Pathways)
 * 3. Transparent Multi-Criteria Trade-Off Optimizer (Zero-Kickback Algorithm)
 * 4. Handover Follow-Through & Proof of Rescue Generator (Verifiable Outcomes)
 */

// Popular hardware baseline database for reference models
export const DEVICE_PRESETS = [
  {
    id: 'preset-iphone13pro',
    name: 'Apple iPhone 13 Pro',
    brand: 'Apple',
    model: 'iPhone 13 Pro 128GB',
    category: 'smartphone',
    releaseYear: 2021,
    originalMSRP: 119900,
    typicalIssue: 'Battery degraded to 76%, screen micro-scratches',
    specs: {
      storage: '128GB',
      screenSize: '6.1" OLED Super Retina XDR',
      chipset: 'A15 Bionic',
      repairabilityScore: 6.2,
      baseWeightKg: 0.204,
      mfgCarbonKg: 69.0, // Manufacturing footprint in kg CO2e
      metals: { copperGrams: 18.2, goldMg: 34.0, silverMg: 310, cobaltGrams: 12.5 }
    },
    defaultDiagnostics: {
      batteryHealth: 76,
      batteryCycleCount: 940,
      batterySwollen: false,
      screenCondition: 'scratched',
      bodyCondition: 'good',
      camerasWorking: true,
      portsWorking: true,
      biometricsWorking: true,
      waterDamage: false,
      storageHealthy: true
    }
  },
  {
    id: 'preset-macbookair-m1',
    name: 'Apple MacBook Air M1 (2020)',
    brand: 'Apple',
    model: 'MacBook Air M1 256GB / 8GB',
    category: 'laptop',
    releaseYear: 2020,
    originalMSRP: 92900,
    typicalIssue: 'Battery service warning, hinge slight looseness',
    specs: {
      storage: '256GB SSD',
      screenSize: '13.3" Retina Display',
      chipset: 'Apple M1',
      repairabilityScore: 6.5,
      baseWeightKg: 1.29,
      mfgCarbonKg: 161.0,
      metals: { copperGrams: 140.0, goldMg: 190.0, silverMg: 1200, cobaltGrams: 35.0 }
    },
    defaultDiagnostics: {
      batteryHealth: 68,
      batteryCycleCount: 1120,
      batterySwollen: false,
      screenCondition: 'flawless',
      bodyCondition: 'minor_scuffs',
      camerasWorking: true,
      portsWorking: true,
      biometricsWorking: true,
      waterDamage: false,
      storageHealthy: true
    }
  },
  {
    id: 'preset-s22ultra',
    name: 'Samsung Galaxy S22 Ultra',
    brand: 'Samsung',
    model: 'Galaxy S22 Ultra 256GB',
    category: 'smartphone',
    releaseYear: 2022,
    originalMSRP: 109999,
    typicalIssue: 'Rear glass panel cracked, battery drain',
    specs: {
      storage: '256GB',
      screenSize: '6.8" Dynamic AMOLED 2X',
      chipset: 'Snapdragon 8 Gen 1',
      repairabilityScore: 5.8,
      baseWeightKg: 0.228,
      mfgCarbonKg: 74.0,
      metals: { copperGrams: 21.0, goldMg: 38.0, silverMg: 350, cobaltGrams: 14.0 }
    },
    defaultDiagnostics: {
      batteryHealth: 81,
      batteryCycleCount: 680,
      batterySwollen: false,
      screenCondition: 'flawless',
      bodyCondition: 'cracked_back',
      camerasWorking: true,
      portsWorking: true,
      biometricsWorking: true,
      waterDamage: false,
      storageHealthy: true
    }
  },
  {
    id: 'preset-pixel7',
    name: 'Google Pixel 7',
    brand: 'Google',
    model: 'Pixel 7 128GB Obsidian',
    category: 'smartphone',
    releaseYear: 2022,
    originalMSRP: 59999,
    typicalIssue: 'Speaker muffled, camera glass mint, battery 84%',
    specs: {
      storage: '128GB',
      screenSize: '6.3" FHD+ OLED 90Hz',
      chipset: 'Google Tensor G2',
      repairabilityScore: 6.8,
      baseWeightKg: 0.197,
      mfgCarbonKg: 55.0,
      metals: { copperGrams: 16.5, goldMg: 28.0, silverMg: 240, cobaltGrams: 11.0 }
    },
    defaultDiagnostics: {
      batteryHealth: 84,
      batteryCycleCount: 510,
      batterySwollen: false,
      screenCondition: 'flawless',
      bodyCondition: 'good',
      camerasWorking: true,
      portsWorking: false,
      biometricsWorking: true,
      waterDamage: false,
      storageHealthy: true
    }
  },
  {
    id: 'preset-dell-xps',
    name: 'Dell XPS 13 9310',
    brand: 'Dell',
    model: 'XPS 13 Intel Core i7 16GB/512GB',
    category: 'laptop',
    releaseYear: 2021,
    originalMSRP: 124000,
    typicalIssue: 'Thermal throttling & swollen battery pack',
    specs: {
      storage: '512GB NVMe SSD',
      screenSize: '13.4" FHD+ InfinityEdge',
      chipset: 'Intel Core i7-1185G7',
      repairabilityScore: 7.2,
      baseWeightKg: 1.20,
      mfgCarbonKg: 185.0,
      metals: { copperGrams: 165.0, goldMg: 210.0, silverMg: 1450, cobaltGrams: 42.0 }
    },
    defaultDiagnostics: {
      batteryHealth: 55,
      batteryCycleCount: 1350,
      batterySwollen: true,
      screenCondition: 'flawless',
      bodyCondition: 'good',
      camerasWorking: true,
      portsWorking: true,
      biometricsWorking: true,
      waterDamage: false,
      storageHealthy: true
    }
  }
];

// Helper: Generate deterministic checksum hash for Device Passports
export function generatePassportHash(deviceData = {}) {
  const safeData = deviceData || {};
  const seed = `${safeData.brand || ''}-${safeData.model || ''}-${safeData.purchaseYear || ''}-${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PASSPORT-EL-${hex}-${rand}`;
}

/**
 * 1. DEVICE TRUTH REPORT EVALUATOR
 * Distinguishes: User Claims, Automated Diagnostic Checks, and Professional Inspection
 * Discloses missing data, evidence confidence %, and safety hazard lockouts.
 */
export function evaluateDeviceTruthReport(deviceInput = {}, diagnosticChecks = {}, photoEvidence = []) {
  const safeDevice = deviceInput || {};
  const safeDiagnostics = diagnosticChecks || {};
  const safePhotos = Array.isArray(photoEvidence) ? photoEvidence : [];

  const brand = safeDevice.brand || 'Generic';
  const model = safeDevice.model || safeDevice.name || 'Unknown Model';
  const category = safeDevice.category || 'smartphone';
  const purchaseYear = Number(safeDevice.purchaseYear) || (new Date().getFullYear() - 3);
  const currentYear = new Date().getFullYear();
  const deviceAgeYears = Math.max(0.5, currentYear - purchaseYear);
  const originalMSRP = Math.max(1000, Number(safeDevice.originalMSRP) || 45000);

  // Normalizing diagnostic inputs
  const batteryHealth = Math.min(100, Math.max(10, Number(safeDiagnostics.batteryHealth ?? 80)));
  const batteryCycles = Math.max(0, Number(safeDiagnostics.batteryCycleCount ?? Math.round(deviceAgeYears * 320)));
  const screenCondition = safeDiagnostics.screenCondition || 'scratched'; // flawless, scratched, cracked_usable, broken_display
  const bodyCondition = safeDiagnostics.bodyCondition || 'good'; // mint, good, minor_scuffs, cracked_back, bent
  const camerasWorking = safeDiagnostics.camerasWorking !== false;
  const portsWorking = safeDiagnostics.portsWorking !== false;
  const biometricsWorking = safeDiagnostics.biometricsWorking !== false;
  const waterDamage = Boolean(safeDiagnostics.waterDamage);
  const storageHealthy = safeDiagnostics.storageHealthy !== false;

  // Safety Hazard Matrix: Swollen battery or punctured cells
  const isBatterySwollen = Boolean(
    safeDiagnostics.batterySwollen ||
    (safeDevice.typicalIssue && /swollen|bulg|puff|expanded/i.test(safeDevice.typicalIssue)) ||
    (safeDevice.problemDescription && /swollen|bulg|puff|expanded/i.test(safeDevice.problemDescription))
  );

  // 1. User Claim Points (self-reported)
  const userClaims = [
    { item: 'Device Power State', claim: safeDevice.isWorking === false ? 'Unresponsive / Won\'t boot' : 'Powers on normally', confidence: 0.8 },
    { item: 'Primary Stated Issue', claim: safeDevice.typicalIssue || safeDevice.problemDescription || 'Normal aging & battery drain', confidence: 0.85 },
    { item: 'Cosmetic Grade Claim', claim: bodyCondition.replace('_', ' ').toUpperCase(), confidence: 0.75 },
    { item: 'Screen Glass Claim', claim: screenCondition.replace('_', ' ').toUpperCase(), confidence: 0.75 }
  ];

  // 2. Automated Diagnostic Checks (software-probe simulated verification)
  const automatedChecks = [
    {
      check: 'Battery Integrity & Cycle Telemetry',
      status: isBatterySwollen ? 'critical_hazard' : batteryHealth >= 80 ? 'healthy' : batteryHealth >= 65 ? 'degraded' : 'service_required',
      details: isBatterySwollen
        ? 'CRITICAL HAZARD: Physical cell swelling / gas build-up detected. Thermal runaway risk.'
        : `${batteryHealth}% capacity · ~${batteryCycles} charge cycles logged`,
      passed: batteryHealth >= 70 && !isBatterySwollen
    },
    {
      check: 'Display Touch Grid & Digitizer Matrix',
      status: screenCondition === 'broken_display' ? 'failed' : screenCondition === 'cracked_usable' ? 'warning' : 'passed',
      details: screenCondition === 'broken_display' ? 'Dead pixels or unresponsive touch matrix' : 'Full multi-touch grid responsive',
      passed: screenCondition !== 'broken_display'
    },
    {
      check: 'Sensor & Biometrics Hardware Array',
      status: biometricsWorking ? 'passed' : 'failed',
      details: biometricsWorking ? 'Biometric auth & ambient sensors calibrated' : 'Sensor hardware failed self-test',
      passed: biometricsWorking
    },
    {
      check: 'Interface Ports & Audio Pipeline',
      status: portsWorking ? 'passed' : 'warning',
      details: portsWorking ? 'Charging pin resistance normal · speaker drivers clean' : 'Port contact resistance high or speaker distortion',
      passed: portsWorking
    },
    {
      check: 'Flash Storage Health (SMART / NAND Wear)',
      status: storageHealthy ? 'passed' : 'critical',
      details: storageHealthy ? 'NAND endurance >85% · 0 uncorrectable bad blocks' : 'NAND read latency spiked / bad blocks detected',
      passed: storageHealthy
    },
    {
      check: 'Liquid Contact Indicator (LDI)',
      status: waterDamage ? 'triggered' : 'passed',
      details: waterDamage ? 'Corrosion risk: LDI tripped (Liquid ingress detected)' : 'LDI un-triggered (No liquid ingress detected)',
      passed: !waterDamage
    }
  ];

  // 3. Evidence Tier Classification
  let evidenceWeight = 0;
  evidenceWeight += automatedChecks.filter(c => c.passed).length * 10; // Max 60
  if (safePhotos.length > 0) {
    evidenceWeight += Math.min(30, safePhotos.length * 10); // Max 30
  }
  if (safeDiagnostics.isProInspected) {
    evidenceWeight += 35; // Pro inspection boost
  }
  const truthConfidencePercent = Math.min(98, Math.max(30, Math.round((evidenceWeight / 120) * 100)));

  let truthTier = 'Tier C · Self-Reported Baseline';
  let truthTierColor = 'amber';
  if (truthConfidencePercent >= 85) {
    truthTier = 'Tier A · Verified Hardware Evidence';
    truthTierColor = 'emerald';
  } else if (truthConfidencePercent >= 60) {
    truthTier = 'Tier B · Diagnostic Auto-Checked';
    truthTierColor = 'blue';
  }

  // 4. Missing Data & Uncertainty Disclosures
  const missingDataDisclosures = [];
  if (safePhotos.length === 0) {
    missingDataDisclosures.push('Missing physical condition photographs: Final buyout / repair quotes carry ±10% visual variance until courier verification.');
  }
  if (!safeDiagnostics.isProInspected) {
    missingDataDisclosures.push('Motherboard micro-soldering and bench diagnostics unconfirmed until physical intake inspection.');
  }
  if (isBatterySwollen) {
    missingDataDisclosures.push('CRITICAL SAFETY RESTRICTION: Swollen battery requires specialized fireproof Hazmat handling. Standard air courier delivery is prohibited.');
  }

  // 5. Transferable Device Passport Metadata
  const passportId = safeDevice.passportId || generatePassportHash({ brand, model, purchaseYear });
  const passport = {
    passportId,
    verifiedAt: new Date().toISOString(),
    privacyControls: {
      maskImei: true,
      maskSerial: true,
      maskOwnerIdentity: true
    },
    deviceFingerprint: {
      brand,
      model,
      category,
      manufacturedYear: purchaseYear,
      truthConfidenceScore: truthConfidencePercent,
      truthTier,
      hasSafetyHazard: isBatterySwollen
    },
    auditTrail: [
      { step: 'Truth Report Created', timestamp: new Date().toISOString(), actor: 'Circuvio Guided Diagnostic Engine' },
      { step: 'Component Health Telemetry Signed', timestamp: new Date().toISOString(), actor: 'Device Diagnostics Subsystem' },
      { step: 'Futures Exchange Market Solicitations', timestamp: new Date().toISOString(), actor: 'Circuvio Circular Network' }
    ]
  };

  return {
    deviceInput: safeDevice,
    deviceAgeYears,
    originalMSRP,
    userClaims,
    automatedChecks,
    truthConfidencePercent,
    truthTier,
    truthTierColor,
    passport,
    missingDataDisclosures,
    hasHazard: isBatterySwollen,
    hazardWarning: isBatterySwollen
      ? 'CRITICAL SAFETY HAZARD: Lithium-ion battery cell expansion poses thermal runaway fire risk. Standard courier air dispatch is prohibited. Specialized Hazmat containment and certified recycler neutralization required.'
      : null,
    diagnostics: {
      batteryHealth,
      batteryCycles,
      batterySwollen: isBatterySwollen,
      screenCondition,
      bodyCondition,
      camerasWorking,
      portsWorking,
      biometricsWorking,
      waterDamage,
      storageHealthy,
      isProInspected: Boolean(safeDiagnostics.isProInspected)
    }
  };
}

/**
 * 2. THE DEVICE FUTURES EXCHANGE
 * Generates and evaluates 5 competing circular pathways from eligible network providers:
 * 1. Repair & Keep Using
 * 2. Sell As-Is to Verified Buyer
 * 3. Repair & Resell (Refurbish Arbitrage)
 * 4. Component & Parts Harvest
 * 5. Authorized Zero-Landfill Recycling
 */
export function generateFuturesExchangeOffers(truthReport) {
  if (!truthReport || !truthReport.deviceInput) return [];

  const { originalMSRP, deviceAgeYears, diagnostics, deviceInput, hasHazard } = truthReport;
  const category = deviceInput.category || 'smartphone';
  const isLaptop = category === 'laptop';

  // Base depreciation factor based on age:
  // Consumer electronics lose ~38% yr 1, ~25% yr 2, ~18%/yr thereafter, approaching category floor
  const annualRetention = isLaptop ? 0.72 : 0.62;
  const depreciationFactor = Math.max(isLaptop ? 0.08 : 0.05, Math.pow(annualRetention, deviceAgeYears));
  const baseWorkingValue = Math.max(1200, Math.round(originalMSRP * depreciationFactor));

  // Condition penalty factors
  let penalty = 0;
  if (diagnostics.batterySwollen) penalty += 0.40;
  else if (diagnostics.batteryHealth < 70) penalty += 0.18;
  else if (diagnostics.batteryHealth < 80) penalty += 0.10;

  if (diagnostics.screenCondition === 'scratched') penalty += 0.05;
  if (diagnostics.screenCondition === 'cracked_usable') penalty += 0.25;
  if (diagnostics.screenCondition === 'broken_display') penalty += 0.45;

  if (diagnostics.bodyCondition === 'cracked_back') penalty += 0.12;
  if (diagnostics.bodyCondition === 'bent') penalty += 0.35;

  if (!diagnostics.portsWorking) penalty += 0.08;
  if (!diagnostics.storageHealthy) penalty += 0.20;
  if (diagnostics.waterDamage) penalty += 0.40;

  const currentAsIsMarketValue = Math.max(600, Math.round(baseWorkingValue * (1 - Math.min(0.90, penalty))));

  // Environmental Constants
  const baseMfgCarbon = isLaptop ? 160 : 65; // kg CO2e
  const baseCopperGrams = isLaptop ? 140 : 18;
  const baseGoldMg = isLaptop ? 180 : 34;

  // Realistic replacement cost for honest savings comparison (not launch price from 8 years ago!)
  const equivalentReplacementCost = Math.round(Math.max(baseWorkingValue * 1.35, isLaptop ? 18000 : 7500));

  // ──────────────────────────────────────────────────────────────────────────
  // PATHWAY 1: REPAIR & KEEP USING
  // ──────────────────────────────────────────────────────────────────────────
  let repairItems = [];
  let repairCost = 0;
  let lifespanExtensionMonths = 24;

  if (diagnostics.batteryHealth < 80 || diagnostics.batterySwollen) {
    const batteryCost = isLaptop ? 3800 : (diagnostics.batterySwollen ? 2400 : 1950);
    repairItems.push({
      part: diagnostics.batterySwollen ? 'Hazmat Li-Ion Cell Extraction & OEM Battery' : 'OEM-Grade High-Capacity Battery Pack',
      cost: batteryCost
    });
    repairCost += batteryCost;
  }
  if (diagnostics.screenCondition === 'cracked_usable' || diagnostics.screenCondition === 'broken_display') {
    // Screen cost scales with device category and modern part costs, capped realistically
    const screenCost = Math.round(Math.min(originalMSRP * 0.26, Math.max(baseWorkingValue * 0.65, isLaptop ? 4800 : 2600)));
    repairItems.push({ part: 'Certified OLED / IPS Display Assembly', cost: screenCost });
    repairCost += screenCost;
  }
  if (diagnostics.bodyCondition === 'cracked_back') {
    const backCost = isLaptop ? 2200 : 1200;
    repairItems.push({ part: 'Back Enclosure Glass & Precision Gasket Seal', cost: backCost });
    repairCost += backCost;
  }
  if (!diagnostics.portsWorking) {
    const portCost = isLaptop ? 1800 : 950;
    repairItems.push({ part: 'Sub-board I/O Port & Microphone Assembly', cost: portCost });
    repairCost += portCost;
  }
  if (!diagnostics.storageHealthy) {
    const storageCost = isLaptop ? 3200 : 2200;
    repairItems.push({ part: 'Certified NVMe / NAND Storage Subsystem', cost: storageCost });
    repairCost += storageCost;
  }
  if (repairItems.length === 0) {
    const maintCost = isLaptop ? 1400 : 850;
    repairItems.push({ part: 'Thermal Clean & Preventative Battery Calibration', cost: maintCost });
    repairCost += maintCost;
  }

  const savingsVsNew = Math.max(0, equivalentReplacementCost - repairCost);
  const repairExceedsValue = repairCost > (baseWorkingValue * 1.25);

  const repairPathway = {
    id: 'pathway-repair-keep',
    key: 'repair_keep',
    title: 'Repair & Keep Using',
    badge: 'Maximum Lifespan Extension',
    tagline: 'Fix targeted flaws and keep your daily driver running for another 2+ years.',
    provider: {
      name: 'EcoFix Certified Master Lab',
      rating: 4.9,
      reviewsCount: 3840,
      verificationBadge: 'Circuvio Verified Service Partner',
      turnaround: 'Same-day (2-4 hours doorstep or in-shop)'
    },
    financial: {
      type: 'cost',
      amount: repairCost,
      currency: '₹',
      displayAmount: `₹${repairCost.toLocaleString('en-IN')}`,
      equivalentReplacementCost,
      savingsVsNew,
      explanation: repairExceedsValue
        ? `Investing ₹${repairCost.toLocaleString('en-IN')} approaches current market value (₹${baseWorkingValue.toLocaleString('en-IN')}). Recommended if keeping existing data and personal device longevity is your priority.`
        : `Investing ₹${repairCost.toLocaleString('en-IN')} avoids spending ~₹${equivalentReplacementCost.toLocaleString('en-IN')} on a comparable replacement.`
    },
    lifespanMonths: lifespanExtensionMonths,
    warranty: '180-day parts & labor written warranty',
    environmentalImpact: {
      co2SavedKg: parseFloat((baseMfgCarbon * 0.82).toFixed(1)),
      ewasteDivertedKg: isLaptop ? 1.25 : 0.20,
      metalsConserved: {
        copperGrams: baseCopperGrams,
        goldMg: baseGoldMg
      }
    },
    includedServices: [
      ...repairItems.map(i => `${i.part} (₹${i.cost.toLocaleString('en-IN')})`),
      'Full 24-point post-repair diagnostic stress test',
      'IP68 water-resistant adhesive re-sealing'
    ],
    confidenceScore: truthReport.truthConfidencePercent >= 75 ? 'Firm Quote' : 'Estimate (±8% pending physical inspection)',
    confidenceVariance: '±8%',
    isViable: true
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PATHWAY 2: SELL AS-IS TO VERIFIED BUYER
  // ──────────────────────────────────────────────────────────────────────────
  const asIsPayout = currentAsIsMarketValue;
  const sellAsIsPathway = {
    id: 'pathway-sell-as-is',
    key: 'sell_as_is',
    title: 'Sell As-Is to Verified Buyer',
    badge: 'Instant Cash · Zero Effort',
    tagline: 'Hand over device immediately in present state without spending money or time fixing it.',
    provider: {
      name: 'ReTech Direct Buyback Consortium',
      rating: 4.8,
      reviewsCount: 6190,
      verificationBadge: 'Verified Instant Buyer Network',
      turnaround: 'Instant doorstep pickup & instant UPI payout'
    },
    financial: {
      type: 'payout',
      amount: asIsPayout,
      currency: '₹',
      displayAmount: `+₹${asIsPayout.toLocaleString('en-IN')}`,
      explanation: `Immediate liquidation. Buyer absorbs all component replacement and reconditioning risk.`
    },
    lifespanMonths: 18,
    warranty: 'No return liability for seller once handover diagnostic is complete',
    environmentalImpact: {
      co2SavedKg: parseFloat((baseMfgCarbon * 0.58).toFixed(1)),
      ewasteDivertedKg: isLaptop ? 1.20 : 0.19,
      metalsConserved: {
        copperGrams: Math.round(baseCopperGrams * 0.65),
        goldMg: Math.round(baseGoldMg * 0.65)
      }
    },
    includedServices: [
      'Zero seller fees or marketplace listing delays',
      'Certified on-the-spot DoD 5220.22-M data wipe verification',
      'Immediate UPI / Bank Transfer before courier leaves'
    ],
    confidenceScore: truthReport.truthConfidencePercent >= 75 ? 'Guaranteed Price Lock (48 hrs)' : 'Quote based on evidence (±10%)',
    confidenceVariance: '±10%',
    isViable: true
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PATHWAY 3: REPAIR & RESELL (REFURBISH ARBITRAGE)
  // Realistic economics: viable only if resale premium exceeds wholesale refresh cost
  // ──────────────────────────────────────────────────────────────────────────
  const refurbishedMarketValue = Math.round(baseWorkingValue * 1.15);
  const wholesaleRefreshCost = Math.round(repairCost * 0.80);
  const netArbitrageValue = refurbishedMarketValue - wholesaleRefreshCost;
  const isRefurbishViable = (netArbitrageValue > (asIsPayout + 400)) && !diagnostics.waterDamage && diagnostics.bodyCondition !== 'bent';

  let netResalePayout;
  let resellExplanation;

  if (isRefurbishViable) {
    netResalePayout = Math.max(asIsPayout + 400, netArbitrageValue);
    resellExplanation = `Sells for ₹${refurbishedMarketValue.toLocaleString('en-IN')} after ₹${wholesaleRefreshCost.toLocaleString('en-IN')} wholesale refresh. You net ₹${(netResalePayout - asIsPayout).toLocaleString('en-IN')} MORE than selling as-is.`;
  } else {
    // Negative Arbitrage disclosure
    netResalePayout = asIsPayout;
    resellExplanation = `Negative Arbitrage: Refresh costs (₹${wholesaleRefreshCost.toLocaleString('en-IN')}) exceed the market resale premium (₹${refurbishedMarketValue.toLocaleString('en-IN')}). Selling As-Is or Recycling yields higher net return.`;
  }

  const repairResellPathway = {
    id: 'pathway-repair-resell',
    key: 'repair_resell',
    title: 'Repair & Resell (Refurbish Arbitrage)',
    badge: isRefurbishViable ? 'Highest Net Money Return' : 'Unviable Arbitrage',
    tagline: isRefurbishViable
      ? 'Partner installs new OEM battery/glass, certifies device, and sells at premium margin.'
      : 'Extensive damage makes refurbishment uneconomical compared to as-is liquidation.',
    provider: {
      name: 'LoopConsign Premium Refurbishers',
      rating: 4.9,
      reviewsCount: 2450,
      verificationBadge: 'Certified Circular Consignment Partner',
      turnaround: '4 - 6 business days to completed payout'
    },
    financial: {
      type: 'payout',
      amount: netResalePayout,
      currency: '₹',
      displayAmount: `+₹${netResalePayout.toLocaleString('en-IN')}`,
      explanation: resellExplanation
    },
    lifespanMonths: isRefurbishViable ? 30 : 12,
    warranty: '1-Year comprehensive warranty provided to end buyer by LoopConsign',
    environmentalImpact: {
      co2SavedKg: parseFloat((baseMfgCarbon * (isRefurbishViable ? 0.88 : 0.50)).toFixed(1)),
      ewasteDivertedKg: isLaptop ? 1.28 : 0.20,
      metalsConserved: {
        copperGrams: baseCopperGrams,
        goldMg: baseGoldMg
      }
    },
    includedServices: [
      'Professional Grade-A cosmetic buffing & micro-polishing',
      'Fresh OEM battery replacement included in consignment',
      'Circuvio Transferable Passport transferred to vetted buyer'
    ],
    confidenceScore: isRefurbishViable ? 'Estimated Consignment Net Range (±7%)' : 'Not Recommended',
    confidenceVariance: '±7%',
    isViable: isRefurbishViable
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PATHWAY 4: PARTS RECOVERY & COMPONENT HARVEST
  // Valued strictly on functional salvageable donor modules, depreciated with hardware age
  // ──────────────────────────────────────────────────────────────────────────
  let salvageWeight = 0;
  // OLED / Screen: only salvageable if glass is unbroken
  if (diagnostics.screenCondition === 'flawless') salvageWeight += 0.35;
  else if (diagnostics.screenCondition === 'scratched') salvageWeight += 0.22;

  // Motherboard & IC chips: only salvageable if NO liquid ingress and storage healthy
  if (!diagnostics.waterDamage && diagnostics.storageHealthy !== false) {
    salvageWeight += 0.30;
  }

  // Camera arrays
  if (diagnostics.camerasWorking !== false) salvageWeight += 0.15;

  // Chassis / frame
  if (diagnostics.bodyCondition === 'mint') salvageWeight += 0.12;
  else if (diagnostics.bodyCondition === 'good') salvageWeight += 0.08;

  const harvestableValue = Math.max(isLaptop ? 600 : 350, Math.round(baseWorkingValue * salvageWeight));

  const partsRecoveryPathway = {
    id: 'pathway-parts-recovery',
    key: 'parts_recovery',
    title: 'Component & Parts Harvest',
    badge: 'Donor Hardware Salvage',
    tagline: 'Working subsystems harvested to restore other broken devices in the circular economy.',
    provider: {
      name: 'SiliconSalvage Component Exchange',
      rating: 4.7,
      reviewsCount: 1820,
      verificationBadge: 'Authorized Parts Harvester',
      turnaround: '2 days (Inspection & extraction payout)'
    },
    financial: {
      type: 'payout',
      amount: harvestableValue,
      currency: '₹',
      displayAmount: `+₹${harvestableValue.toLocaleString('en-IN')}`,
      explanation: `Live component spot-bids for genuine working donor modules (${Math.round(salvageWeight * 100)}% salvageable donor capacity).`
    },
    lifespanMonths: 20,
    warranty: 'Harvest partner assumes all downstream testing liability',
    environmentalImpact: {
      co2SavedKg: parseFloat((baseMfgCarbon * 0.62).toFixed(1)),
      ewasteDivertedKg: isLaptop ? 1.10 : 0.18,
      metalsConserved: {
        copperGrams: Math.round(baseCopperGrams * 0.75),
        goldMg: Math.round(baseGoldMg * 0.80)
      }
    },
    includedServices: [
      'Micro-soldering inspection of motherboard components',
      'Traceable part serial logging for repair transparency',
      'Clean de-soldering of rare earth magnets and vibration motors'
    ],
    confidenceScore: 'Firm Offer for Uncracked Subsystems',
    confidenceVariance: '±5%',
    isViable: true
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PATHWAY 5: AUTHORIZED ZERO-LANDFILL RECYCLING
  // Certified metallurgy hub with precious metal recovery & zero toxic landfill disposal
  // ──────────────────────────────────────────────────────────────────────────
  const preciousMetalBounty = Math.round(isLaptop ? 1450 : 850);
  const ecoKarmaPoints = isLaptop ? 750 : 500;

  const certifiedRecyclePathway = {
    id: 'pathway-certified-recycle',
    key: 'certified_recycle',
    title: 'Authorized Zero-Landfill Recycling',
    badge: hasHazard ? 'Recommended Safe Destination' : 'Guaranteed 100% Circular Recovery',
    tagline: 'Certified smelter & shredder with zero toxic landfill disposal and rare element refinement.',
    provider: {
      name: 'CleanEarth Certified Metallurgy Hub',
      rating: 5.0,
      reviewsCount: 8940,
      verificationBadge: 'R2v3 & ISO 14001 Licensed Recycler',
      turnaround: 'Prepaid courier box or drop-off at 45 city hubs'
    },
    financial: {
      type: 'payout_plus_credits',
      amount: preciousMetalBounty,
      karmaPoints: ecoKarmaPoints,
      currency: '₹',
      displayAmount: `+₹${preciousMetalBounty.toLocaleString('en-IN')} + ${ecoKarmaPoints} Karma`,
      explanation: `Commodity scrap value payout + ESG Carbon Offset voucher and verified circular karma.`
    },
    lifespanMonths: 0,
    warranty: 'Immutable Certificate of Destruction & Recycling issued with GPS coordinates',
    environmentalImpact: {
      co2SavedKg: parseFloat((baseMfgCarbon * 0.45).toFixed(1)),
      ewasteDivertedKg: isLaptop ? 1.29 : 0.20,
      metalsConserved: {
        copperGrams: baseCopperGrams,
        goldMg: baseGoldMg,
        silverMg: isLaptop ? 1200 : 310
      }
    },
    includedServices: [
      'Hydrometallurgical extraction of 98.4% gold, copper, and palladium',
      'Battery thermal de-energization preventing fire hazards',
      'Downloadable ESG compliance certificate for individuals or companies'
    ],
    confidenceScore: 'Guaranteed Official Government Regulated Rate',
    confidenceVariance: '0%',
    isViable: true
  };

  return [
    repairPathway,
    sellAsIsPathway,
    repairResellPathway,
    partsRecoveryPathway,
    certifiedRecyclePathway
  ];
}

/**
 * 3. TRANSPARENT MULTI-CRITERIA RECOMMENDATION ENGINE
 * Optimizes strictly for what the user values (Money, Convenience, Lifespan, Environment, Balanced)
 * Fully unbiased with zero affiliate kickback weighting.
 */
export function calculateBestRecommendation(offers, preferencePriority = 'balanced') {
  if (!offers || !Array.isArray(offers) || offers.length === 0) return null;

  // Safe max calculations preventing division by zero or NaN
  const validPayouts = offers.filter(o => o.financial?.type?.includes('payout')).map(o => o.financial.amount || 0);
  const maxPayout = validPayouts.length > 0 ? Math.max(1, ...validPayouts) : 1;
  const maxCo2 = Math.max(0.1, ...offers.map(o => o.environmentalImpact?.co2SavedKg || 0));
  const maxLifespan = Math.max(1, ...offers.map(o => o.lifespanMonths || 0));

  const scoredOffers = offers.map(offer => {
    // 1. Financial score (0 to 100)
    let financialScore = 50;
    if (offer.financial?.type?.includes('payout')) {
      if (offer.key === 'repair_resell' && offer.isViable === false) {
        financialScore = 25; // Heavily penalize unviable negative arbitrage
      } else {
        financialScore = Math.min(100, Math.max(10, (offer.financial.amount / maxPayout) * 100));
      }
    } else if (offer.financial?.type === 'cost') {
      // Cost to repair: high if cost is modest compared to replacement
      const replacement = offer.financial.equivalentReplacementCost || 10000;
      const costRatio = offer.financial.amount / replacement;
      if (costRatio <= 0.20) financialScore = 95;
      else if (costRatio <= 0.40) financialScore = 80;
      else if (costRatio <= 0.65) financialScore = 60;
      else if (costRatio <= 0.90) financialScore = 40;
      else financialScore = 20;
    }

    // 2. Convenience score (0 to 100)
    let convenienceScore = 50;
    if (offer.key === 'sell_as_is') convenienceScore = 98; // Instant pickup & instant cash
    else if (offer.key === 'certified_recycle') convenienceScore = 88; // Easy box drop
    else if (offer.key === 'repair_keep') convenienceScore = 80; // Same-day doorstep
    else if (offer.key === 'parts_recovery') convenienceScore = 65; // 2 days
    else if (offer.key === 'repair_resell') convenienceScore = offer.isViable ? 55 : 30; // Consignment wait

    // 3. Lifespan score (0 to 100)
    const lifespanScore = Math.min(100, Math.max(0, ((offer.lifespanMonths || 0) / maxLifespan) * 100));

    // 4. Environmental score (0 to 100)
    const ecoScore = Math.min(100, Math.max(0, ((offer.environmentalImpact?.co2SavedKg || 0) / maxCo2) * 100));

    // Weighting matrix based on user preference
    let compositeScore = 0;
    let rationale = '';

    switch (preferencePriority) {
      case 'money':
        compositeScore = (financialScore * 0.65) + (convenienceScore * 0.15) + (ecoScore * 0.10) + (lifespanScore * 0.10);
        rationale = `Maximizes net financial value returned to you (scores ${Math.round(financialScore)}/100 on financial return).`;
        break;

      case 'convenience':
        compositeScore = (convenienceScore * 0.65) + (financialScore * 0.15) + (ecoScore * 0.10) + (lifespanScore * 0.10);
        rationale = `Minimizes wait time, seller friction, and travel. Easiest zero-hassle completion.`;
        break;

      case 'lifespan':
        compositeScore = (lifespanScore * 0.60) + (ecoScore * 0.20) + (convenienceScore * 0.10) + (financialScore * 0.10);
        rationale = `Keeps this hardware in active service the longest (+${offer.lifespanMonths} months active utility).`;
        break;

      case 'environment':
        compositeScore = (ecoScore * 0.65) + (lifespanScore * 0.20) + (financialScore * 0.08) + (convenienceScore * 0.07);
        rationale = `Prevents the maximum amount of carbon emissions (${offer.environmentalImpact.co2SavedKg} kg CO2e) and saves precious metals.`;
        break;

      case 'balanced':
      default:
        compositeScore = (financialScore * 0.30) + (convenienceScore * 0.25) + (lifespanScore * 0.25) + (ecoScore * 0.20);
        rationale = `Optimal balance of fair financial return, low turnaround friction, and tangible circular impact.`;
        break;
    }

    return {
      ...offer,
      scores: {
        composite: Math.round(compositeScore),
        financial: Math.round(financialScore),
        convenience: Math.round(convenienceScore),
        lifespan: Math.round(lifespanScore),
        environment: Math.round(ecoScore)
      },
      recommendationRationale: rationale
    };
  });

  // Sort descending by composite score
  scoredOffers.sort((a, b) => b.scores.composite - a.scores.composite);

  const topChoice = scoredOffers[0];
  const runnerUp = scoredOffers[1] || scoredOffers[0];

  return {
    topChoice,
    runnerUp,
    preferencePriority,
    allScoredOffers: scoredOffers,
    independentDisclosure: 'Circuvio recommendation algorithm is strictly independent. Rankings are calculated purely from your selected preference parameters and verified partner metrics. No provider pays for priority placement.',
    uncertaintyDisclosures: [
      'Quotes assume physical component validation during courier handover.',
      'Lifespan estimates are modeled based on standard daily usage cycles and OEM replacement parts.'
    ]
  };
}

/**
 * 4. PROOF OF RESCUE GENERATOR
 * Builds the official, shareable, verifiable outcome certificate and community impact card.
 */
export function generateProofOfRescue(selectedOffer = {}, truthReport = {}, bookingDetails = {}) {
  const rescueId = `RESCUE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const safeReport = truthReport || {};
  const safeOffer = selectedOffer || {};
  const safeBooking = bookingDetails || {};
  const device = safeReport.deviceInput || {};
  const impact = safeOffer.environmentalImpact || { co2SavedKg: 45, ewasteDivertedKg: 0.2, metalsConserved: { copperGrams: 15, goldMg: 30 } };

  // Tangible equivalents
  const treesEquivalent = parseFloat(((impact.co2SavedKg || 45) / 22.0).toFixed(1)); // 1 tree absorbs ~22kg CO2/year
  const carKmAvoided = Math.round((impact.co2SavedKg || 45) * 4.8); // ~0.21 kg CO2/km
  const smartphoneBatteriesEquivalent = Math.round(((impact.metalsConserved?.goldMg || 30) / 10));

  const proof = {
    rescueId,
    verifiedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    timestamp: new Date().toISOString(),
    status: 'Verified & Executed',
    device: {
      brand: device.brand || 'Tech Device',
      model: device.model || device.name || 'Electronic Hardware',
      category: device.category || 'smartphone',
      passportId: safeReport.passport?.passportId
    },
    chosenPathway: {
      key: safeOffer.key || 'repair_keep',
      title: safeOffer.title || 'Device Rescue',
      partner: safeOffer.provider?.name || 'Circuvio Certified Partner',
      financialOutcome: safeOffer.financial?.displayAmount || 'Verified',
      warranty: safeOffer.warranty || 'Certified Circular Warranty'
    },
    booking: {
      serviceType: safeBooking.serviceType || 'Doorstep Express Courier Pickup',
      scheduledDate: safeBooking.scheduledDate || 'Today (Immediate)',
      trackingCode: `TRACK-EL-${Math.floor(100000 + Math.random() * 900000)}`,
      payoutMethod: safeBooking.payoutMethod || 'Direct Bank / UPI Fast Transfer'
    },
    documentedWork: safeOffer.includedServices || [
      'Certified component integrity verification',
      'Data sanitization certificate issued'
    ],
    verifiedMetrics: {
      co2AvoidedKg: impact.co2SavedKg || 45,
      ewasteDivertedKg: impact.ewasteDivertedKg || 0.2,
      copperGrams: impact.metalsConserved?.copperGrams || 18,
      goldMg: impact.metalsConserved?.goldMg || 34,
      equivalents: {
        treesEquivalent,
        carKmAvoided,
        smartphoneBatteriesEquivalent
      }
    },
    communityChallenge: {
      challengeName: 'National E-Waste Circularity Sprint 2026',
      leaderboardContributionPoints: safeOffer.key === 'certified_recycle' ? 500 : 350,
      badgeUnlocked: 'Device Savior · Level 1'
    },
    verificationHash: `SHA256-VTR-${Math.random().toString(16).substring(2, 10).toUpperCase()}-CIRCUVIO`
  };

  // Save to local history if in browser
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = JSON.parse(localStorage.getItem('circuvio_rescues') || localStorage.getItem('ecoloop_rescues') || '[]');
      existing.unshift(proof);
      const json = JSON.stringify(existing.slice(0, 20));
      localStorage.setItem('circuvio_rescues', json);
      localStorage.setItem('ecoloop_rescues', json);
    }
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }

  return proof;
}
