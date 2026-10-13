export type DevicePowerState = 'powers_on' | 'intermittent' | 'dead';
export type ScreenCondition = 'flawless' | 'scratched' | 'cracked' | 'unresponsive';
export type BatteryCondition = 'normal' | 'degraded' | 'swollen';
export type CircularPriority = 'max_value' | 'fast_cash' | 'extend_life' | 'zero_waste';

export type CircularRouteKey = 'repair' | 'sell_as_is' | 'refurbish_resell' | 'spare_parts' | 'certified_recycle';

export interface DecisionInput {
  deviceCategory: string;
  brand: string;
  model: string;
  ageYears: number;
  powerState: DevicePowerState;
  screenCondition: ScreenCondition;
  batteryCondition: BatteryCondition;
  userPriority: CircularPriority;
}

export interface RouteOption {
  route: CircularRouteKey;
  title: string;
  tagline: string;
  estimatedFinancialValue: number; // in CAD
  estimatedCostToUser: number; // in CAD
  co2SavingsKg: number;
  feasibilityScore: number; // 1-10
  isRecommended: boolean;
  isHazardBlocked: boolean;
  hazardReason?: string;
  rationale: string;
}

export interface DecisionResult {
  isHazardous: boolean;
  hazardNotice?: string;
  primaryRecommendation: RouteOption;
  availableRoutes: RouteOption[];
  repairabilityScore: number;
  carbonDivertedKg: number;
  confidenceScore: number;
}

// Category base values (approximate benchmark values for modern electronics)
const CATEGORY_BENCHMARKS: Record<string, { baseValue: number; co2Kg: number; screenFixCost: number; batteryFixCost: number }> = {
  smartphone: { baseValue: 650, co2Kg: 55, screenFixCost: 130, batteryFixCost: 65 },
  laptop: { baseValue: 1100, co2Kg: 280, screenFixCost: 220, batteryFixCost: 95 },
  tablet: { baseValue: 480, co2Kg: 95, screenFixCost: 110, batteryFixCost: 60 },
  audio: { baseValue: 200, co2Kg: 25, screenFixCost: 0, batteryFixCost: 40 },
  gaming: { baseValue: 400, co2Kg: 140, screenFixCost: 80, batteryFixCost: 45 },
  wearable: { baseValue: 250, co2Kg: 30, screenFixCost: 90, batteryFixCost: 50 },
  other: { baseValue: 150, co2Kg: 40, screenFixCost: 50, batteryFixCost: 35 },
};

export function evaluateCircularRoutes(input: DecisionInput): DecisionResult {
  const normalizedCategory = (input.deviceCategory || '').toLowerCase().trim();
  const bench = CATEGORY_BENCHMARKS[normalizedCategory] || CATEGORY_BENCHMARKS.other;
  const isSwollenBattery = (input.batteryCondition || '').toLowerCase().trim() === 'swollen';

  // 1. HAZARD DETECTION: Swollen Battery
  if (isSwollenBattery) {
    const hazardRec: RouteOption = {
      route: 'certified_recycle',
      title: 'Certified Hazardous E-Waste Drop-Off',
      tagline: 'Urgent containment & professional battery extraction',
      estimatedFinancialValue: 0,
      estimatedCostToUser: 0,
      co2SavingsKg: bench.co2Kg * 0.4,
      feasibilityScore: 10,
      isRecommended: true,
      isHazardBlocked: false,
      rationale:
        'A swollen lithium-ion battery presents severe thermal runaway and fire risk. Resale, postal courier shipping, and unlicensed disassembly are legally restricted. EcoLoop routes you directly to a licensed municipal hazardous e-waste depot.',
    };

    const blockedRepair: RouteOption = {
      route: 'repair',
      title: 'Professional Repair',
      tagline: 'Hazard restricted',
      estimatedFinancialValue: 0,
      estimatedCostToUser: 0,
      co2SavingsKg: 0,
      feasibilityScore: 0,
      isRecommended: false,
      isHazardBlocked: true,
      hazardReason: 'Swollen cells require specialized hazard containment before repair consideration.',
      rationale: 'Temporarily blocked for your safety.',
    };

    const blockedSell: RouteOption = {
      route: 'sell_as_is',
      title: 'Marketplace Resale',
      tagline: 'Hazard restricted',
      estimatedFinancialValue: 0,
      estimatedCostToUser: 0,
      co2SavingsKg: 0,
      feasibilityScore: 0,
      isRecommended: false,
      isHazardBlocked: true,
      hazardReason: 'Shipping or selling ruptured lithium-ion cells violates product safety standards.',
      rationale: 'Blocked for platform compliance.',
    };

    return {
      isHazardous: true,
      hazardNotice:
        'CRITICAL SAFETY WARNING: Swollen lithium battery detected. Do NOT puncture, recharge, or dispose in regular trash. Place device on a non-flammable surface.',
      primaryRecommendation: hazardRec,
      availableRoutes: [hazardRec, blockedRepair, blockedSell],
      repairabilityScore: 2,
      carbonDivertedKg: Number((bench.co2Kg * 0.4).toFixed(1)),
      confidenceScore: 98,
    };
  }

  // 2. FINANCIAL & FEASIBILITY CALCULATION
  const numericAge = typeof input.ageYears === 'number' && !isNaN(input.ageYears) ? input.ageYears : 1;
  const safeAge = Math.max(0, numericAge);
  const ageDepreciation = Math.max(0.15, Math.pow(0.72, Math.min(safeAge, 6)));
  const baseResidual = bench.baseValue * ageDepreciation;

  // Condition penalties
  let conditionFactor = 1.0;
  if (input.powerState === 'dead') conditionFactor *= 0.25;
  else if (input.powerState === 'intermittent') conditionFactor *= 0.65;

  if (input.screenCondition === 'cracked') conditionFactor *= 0.55;
  else if (input.screenCondition === 'unresponsive') conditionFactor *= 0.4;

  const estimatedAsIsResale = Math.max(10, Math.round(baseResidual * conditionFactor));

  // Repair feasibility
  let repairCost = 0;
  if (input.screenCondition === 'cracked' || input.screenCondition === 'unresponsive') {
    repairCost += bench.screenFixCost;
  }
  if (input.batteryCondition === 'degraded') {
    repairCost += bench.batteryFixCost;
  }
  if (input.powerState === 'dead') {
    repairCost += 90; // Logic board diagnosis
  }

  const postRepairResale = Math.round(baseResidual * 0.9);
  const netRepairGain = postRepairResale - repairCost;

  // 3. GENERATE CANDIDATE ROUTES
  const repairRoute: RouteOption = {
    route: 'repair',
    title: 'Professional Repair',
    tagline: 'Extend device lifespan & restore peak performance',
    estimatedFinancialValue: postRepairResale,
    estimatedCostToUser: repairCost,
    co2SavingsKg: bench.co2Kg * 0.85,
    feasibilityScore: repairCost < baseResidual ? 8.5 : 4.0,
    isRecommended: false,
    isHazardBlocked: false,
    rationale: `Estimated repair cost of ~$${repairCost} restores your device to a market value of ~$${postRepairResale}, preventing ${Math.round(bench.co2Kg * 0.85)}kg of manufacturing emissions.`,
  };

  const sellAsIsRoute: RouteOption = {
    route: 'sell_as_is',
    title: 'Sell As-Is on Marketplace',
    tagline: 'Direct peer-to-peer sale with zero upfront repair cost',
    estimatedFinancialValue: estimatedAsIsResale,
    estimatedCostToUser: 0,
    co2SavingsKg: bench.co2Kg * 0.65,
    feasibilityScore: 9.0,
    isRecommended: false,
    isHazardBlocked: false,
    rationale: `Sell directly to hobbyists or local buyers seeking parts or DIY projects for ~$${estimatedAsIsResale}. Fast turnaround with no repair effort.`,
  };

  const refurbishRoute: RouteOption = {
    route: 'refurbish_resell',
    title: 'Trade to Verified Business',
    tagline: 'Wholesale trade-in to certified refurbishers',
    estimatedFinancialValue: Math.round(estimatedAsIsResale * 1.15),
    estimatedCostToUser: 0,
    co2SavingsKg: bench.co2Kg * 0.9,
    feasibilityScore: 8.0,
    isRecommended: false,
    isHazardBlocked: false,
    rationale: `Certified refurbishers purchase devices for inspection, repair, and resale with warranty, offering dependable payment and official documentation.`,
  };

  const partsRoute: RouteOption = {
    route: 'spare_parts',
    title: 'Harvest for Spare Parts',
    tagline: 'Supply valuable camera, chassis & logic board assemblies',
    estimatedFinancialValue: Math.max(15, Math.round(baseResidual * 0.35)),
    estimatedCostToUser: 0,
    co2SavingsKg: bench.co2Kg * 0.5,
    feasibilityScore: 7.5,
    isRecommended: false,
    isHazardBlocked: false,
    rationale: `Individual OEM components (camera modules, housing, connectors) possess strong circular demand among local repair technicians.`,
  };

  const recycleRoute: RouteOption = {
    route: 'certified_recycle',
    title: 'Certified Circular Recycling',
    tagline: 'Closed-loop precious metal & copper recovery',
    estimatedFinancialValue: 0,
    estimatedCostToUser: 0,
    co2SavingsKg: bench.co2Kg * 0.35,
    feasibilityScore: 10.0,
    isRecommended: false,
    isHazardBlocked: false,
    rationale: `Safely diverts toxic heavy metals from landfill while recovering gold, palladium, and copper. Official recycling certificate issued.`,
  };

  // 4. RANK ACCORDING TO USER PRIORITY & DEVICE STATE
  const allRoutes = [repairRoute, sellAsIsRoute, refurbishRoute, partsRoute, recycleRoute];

  let chosenRoute: RouteOption;

  if (input.userPriority === 'zero_waste') {
    chosenRoute = recycleRoute;
  } else if (input.userPriority === 'extend_life' && netRepairGain > 0) {
    chosenRoute = repairRoute;
  } else if (input.userPriority === 'max_value' && netRepairGain > estimatedAsIsResale) {
    chosenRoute = repairRoute;
  } else if (input.userPriority === 'fast_cash') {
    chosenRoute = sellAsIsRoute;
  } else if (input.powerState === 'dead' && input.ageYears > 4) {
    chosenRoute = recycleRoute;
  } else if (netRepairGain > estimatedAsIsResale + 50) {
    chosenRoute = repairRoute;
  } else if (estimatedAsIsResale > 40) {
    chosenRoute = sellAsIsRoute;
  } else {
    chosenRoute = recycleRoute;
  }

  chosenRoute.isRecommended = true;

  // Sort: Recommended first, then by feasibility
  allRoutes.sort((a, b) => {
    if (a.isRecommended) return -1;
    if (b.isRecommended) return 1;
    return b.feasibilityScore - a.feasibilityScore;
  });

  return {
    isHazardous: false,
    primaryRecommendation: chosenRoute,
    availableRoutes: allRoutes,
    repairabilityScore: repairCost > 0 && repairCost < baseResidual ? 7.5 : 4.0,
    carbonDivertedKg: Number(chosenRoute.co2SavingsKg.toFixed(1)),
    confidenceScore: 92,
  };
}
