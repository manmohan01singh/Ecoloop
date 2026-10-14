import { Device, WasteDeposit, ListingRequest, RepairRequest } from '../models/index.js';
import { calculateImpact } from '../services/deathClock.service.js';

export const getUserImpact = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const devices = await Device.findAll({ where: { userId } });

    const totals = devices.reduce(
      (acc, d) => {
        const impact = calculateImpact(d.toJSON());
        acc.co2Saved         += impact.co2Saved;
        acc.energySaved      += impact.energySaved;
        acc.materialsRecovered += impact.materialsRecovered;
        acc.waterSaved       += impact.waterSaved;
        return acc;
      },
      { co2Saved: 0, energySaved: 0, materialsRecovered: 0, waterSaved: 0 }
    );

    // Device action counts from status field
    const devicesReused    = devices.filter(d => d.status === 'sold').length;
    const devicesRecycled  = devices.filter(d => d.status === 'recycled' || d.status === 'disposed').length;

    // Count completed repair requests by this user
    let devicesRepaired = 0;
    try {
      devicesRepaired = await RepairRequest.count({ where: { userId, status: 'completed' } });
    } catch {}

    // Count waste deposits by this user
    let wasteDeposits = 0;
    let totalKgDeposited = 0;
    try {
      const deposits = await WasteDeposit.findAll({ where: { userId } });
      wasteDeposits = deposits.length;
      totalKgDeposited = deposits.reduce((a, d) => a + parseFloat(d.weightKg || 0), 0);
    } catch {}

    // Sustainability score (0–100) — weighted formula
    const score = Math.min(100, Math.round(
      (devices.length * 5) +
      (devicesRepaired * 15) +
      (devicesReused * 10) +
      (devicesRecycled * 8) +
      (wasteDeposits * 5) +
      Math.min(20, totals.co2Saved)
    ));

    // Badges
    const badges = [];
    if (devices.length >= 1) badges.push({ id: 'first_step',   name: 'First Step',       description: 'Registered first device',   icon: '🌱' });
    if (devices.length >= 5) badges.push({ id: 'eco_warrior',  name: 'Eco Warrior',       description: 'Tracked 5+ devices',        icon: '🌿' });
    if (devices.length >= 10) badges.push({ id: 'green_champ', name: 'Green Champion',    description: 'Tracked 10+ devices',       icon: '🌳' });
    if (devicesRepaired >= 1)  badges.push({ id: 'fixer',      name: 'Fixer',             description: 'Completed first repair',    icon: '🔧' });
    if (devicesRecycled >= 1)  badges.push({ id: 'recycler',   name: 'Recycler',          description: 'Recycled a device',         icon: '♻️' });
    if (wasteDeposits >= 3)    badges.push({ id: 'depositor',  name: 'Waste Depositor',   description: 'Made 3+ waste deposits',    icon: '🏦' });
    if (score >= 50)           badges.push({ id: 'sustainable',name: 'Sustainability Hero',description: 'Score reached 50+',         icon: '🏆' });

    res.json({
      success: true,
      data: {
        totalDevices: devices.length,
        devicesReused,
        devicesRepaired,
        devicesRecycled,
        wasteDeposits,
        totalKgDeposited: parseFloat(totalKgDeposited.toFixed(2)),
        sustainabilityScore: score,
        totals: {
          co2Saved:           parseFloat(totals.co2Saved.toFixed(1)),
          energySaved:        parseFloat(totals.energySaved.toFixed(1)),
          materialsRecovered: parseFloat(totals.materialsRecovered.toFixed(1)),
          waterSaved:         parseFloat(totals.waterSaved.toFixed(1)),
        },
        badges,
        disclaimer: 'Environmental estimates are approximations based on industry averages and should not be treated as exact measurements.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGlobalImpact = async (req, res, next) => {
  try {
    const totalDevices = await Device.count();

    res.json({
      success: true,
      data: {
        totalDevicesTracked: totalDevices,
        estimatedCo2Saved: totalDevices * 65,
        estimatedEnergySaved: totalDevices * 130,
        estimatedMaterialsRecovered: totalDevices * 1.5,
        message: 'Join Circuvio and contribute to a sustainable future!',
      },
    });
  } catch (error) {
    next(error);
  }
};
