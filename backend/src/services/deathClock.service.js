/**
 * Death Clock Service
 * Predicts device end-of-life using rule-based algorithm (MVP)
 * Can be upgraded to ML model later
 */

const CATEGORY_LIFESPAN = {
  smartphone: 3,
  laptop: 5,
  tablet: 4,
  tv: 8,
  refrigerator: 15,
  washing_machine: 12,
  ac: 15,
  computer: 5,
  printer: 5,
  other: 5,
};

const CONDITION_MULTIPLIER = {
  excellent: 1.2,
  good: 1.0,
  fair: 0.85,
  poor: 0.65,
  damaged: 0.4,
};

const USAGE_IMPACT = {
  low: 1.1,       // < 2 hours/day
  moderate: 1.0,  // 2-6 hours/day
  high: 0.85,     // 6-10 hours/day
  extreme: 0.7,   // > 10 hours/day
};

function getUsageCategory(hours) {
  if (hours < 2) return 'low';
  if (hours < 6) return 'moderate';
  if (hours < 10) return 'high';
  return 'extreme';
}

export function calculateDeathClock(device) {
  const baseLife = CATEGORY_LIFESPAN[device.category] || 5;
  const conditionMultiplier = CONDITION_MULTIPLIER[device.condition] || 1.0;
  const usageCategory = getUsageCategory(parseFloat(device.usageHoursPerDay) || 4);
  const usageMultiplier = USAGE_IMPACT[usageCategory];

  // Adjusted lifespan based on condition and usage
  const adjustedLife = baseLife * conditionMultiplier * usageMultiplier;

  // Calculate age in years
  const purchaseDate = new Date(device.purchaseDate);
  const now = new Date();
  const ageInYears = (now - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);

  // Remaining life
  const remainingLife = Math.max(0, adjustedLife - ageInYears);
  const remainingDays = Math.round(remainingLife * 365.25);

  // Health score (0-100)
  const healthScore = Math.round((remainingLife / adjustedLife) * 100);

  // Status
  let status;
  if (healthScore >= 80) status = 'excellent';
  else if (healthScore >= 60) status = 'healthy';
  else if (healthScore >= 40) status = 'warning';
  else if (healthScore >= 20) status = 'critical';
  else status = 'dead';

  // Death date
  const deathDate = new Date(purchaseDate);
  deathDate.setFullYear(deathDate.getFullYear() + Math.floor(adjustedLife));
  deathDate.setMonth(deathDate.getMonth() + Math.round((adjustedLife % 1) * 12));

  // Factors
  const factors = [
    {
      name: 'Device Age',
      impact: -Math.round((ageInYears / adjustedLife) * 40),
      description: `Device is ${ageInYears.toFixed(1)} years old`,
    },
    {
      name: 'Category',
      impact: 0,
      description: `${device.category} has ${baseLife} year average lifespan`,
    },
    {
      name: 'Condition',
      impact: Math.round((conditionMultiplier - 1) * 20),
      description: `Condition: ${device.condition} (${conditionMultiplier > 1 ? '+' : ''}${Math.round((conditionMultiplier - 1) * 100)}%)`,
    },
    {
      name: 'Usage Pattern',
      impact: Math.round((usageMultiplier - 1) * 20),
      description: `${usageCategory} usage (${device.usageHoursPerDay || 4} hrs/day)`,
    },
  ];

  // Recommendations
  const recommendations = [];
  if (healthScore < 20) {
    recommendations.push('Device is near end-of-life. Consider replacing soon.');
    recommendations.push('Back up all important data immediately.');
    recommendations.push('Check for trade-in or exchange offers.');
  } else if (healthScore < 40) {
    recommendations.push('Device is approaching end-of-life. Start planning replacement.');
    recommendations.push('Back up your data regularly.');
    recommendations.push('Consider professional maintenance.');
  } else if (healthScore < 60) {
    recommendations.push('Device is mid-life. Maintain good care habits.');
    recommendations.push('Keep software updated for security.');
  } else {
    recommendations.push('Device is in good health. Continue regular maintenance.');
    recommendations.push('Keep OS and apps updated.');
  }

  if (device.category === 'smartphone' || device.category === 'laptop') {
    recommendations.push('Check battery health in device settings.');
  }

  return {
    deviceId: device.id,
    deathDate: deathDate.toISOString().split('T')[0],
    remainingDays,
    remainingYears: parseFloat(remainingLife.toFixed(1)),
    healthScore,
    status,
    adjustedLifespan: parseFloat(adjustedLife.toFixed(1)),
    ageInYears: parseFloat(ageInYears.toFixed(1)),
    factors,
    recommendations,
    categoryBaseLife: baseLife,
  };
}

export function calculateImpact(device, action = 'recycle') {
  const IMPACT_DATA = {
    smartphone: { co2: 50, energy: 100, materials: 0.5, water: 500 },
    laptop: { co2: 100, energy: 200, materials: 1.5, water: 800 },
    tablet: { co2: 40, energy: 80, materials: 0.3, water: 400 },
    tv: { co2: 150, energy: 300, materials: 3, water: 1000 },
    refrigerator: { co2: 200, energy: 500, materials: 5, water: 1500 },
    washing_machine: { co2: 120, energy: 250, materials: 3, water: 1000 },
    ac: { co2: 180, energy: 400, materials: 4, water: 1200 },
    computer: { co2: 120, energy: 250, materials: 2, water: 900 },
    printer: { co2: 30, energy: 60, materials: 0.8, water: 300 },
    other: { co2: 50, energy: 100, materials: 1, water: 500 },
  };

  const base = IMPACT_DATA[device.category] || IMPACT_DATA.other;
  const multiplier = action === 'recycle' ? 1.0 : 0.6;

  return {
    co2Saved: parseFloat((base.co2 * multiplier).toFixed(1)),
    energySaved: parseFloat((base.energy * multiplier).toFixed(1)),
    materialsRecovered: parseFloat((base.materials * multiplier).toFixed(1)),
    waterSaved: parseFloat((base.water * multiplier).toFixed(1)),
    units: {
      co2: 'kg',
      energy: 'kWh',
      materials: 'kg',
      water: 'liters',
    },
  };
}
