import { Device } from '../models/index.js';
import { calculateImpact } from '../services/deathClock.service.js';

export const getUserImpact = async (req, res, next) => {
  try {
    const devices = await Device.findAll({ where: { userId: req.params.userId || req.user.id } });

    const impacts = devices.map((d) => ({
      device: d.name,
      category: d.category,
      ...calculateImpact(d.toJSON()),
    }));

    const totals = devices.reduce(
      (acc, d) => {
        const impact = calculateImpact(d.toJSON());
        acc.co2Saved += impact.co2Saved;
        acc.energySaved += impact.energySaved;
        acc.materialsRecovered += impact.materialsRecovered;
        acc.waterSaved += impact.waterSaved;
        return acc;
      },
      { co2Saved: 0, energySaved: 0, materialsRecovered: 0, waterSaved: 0 }
    );

    // Badges
    const badges = [];
    if (devices.length >= 1) badges.push({ name: 'First Step', description: 'Registered first device', icon: '🌱' });
    if (devices.length >= 5) badges.push({ name: 'Eco Warrior', description: 'Tracked 5+ devices', icon: '🌿' });
    if (devices.length >= 10) badges.push({ name: 'Green Champion', description: 'Tracked 10+ devices', icon: '🌳' });

    res.json({
      success: true,
      data: {
        totalDevices: devices.length,
        totals: {
          co2Saved: parseFloat(totals.co2Saved.toFixed(1)),
          energySaved: parseFloat(totals.energySaved.toFixed(1)),
          materialsRecovered: parseFloat(totals.materialsRecovered.toFixed(1)),
          waterSaved: parseFloat(totals.waterSaved.toFixed(1)),
        },
        breakdown: impacts,
        badges,
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
        message: 'Join EcoLoop and contribute to a sustainable future!',
      },
    });
  } catch (error) {
    next(error);
  }
};
