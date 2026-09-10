import { User, Device } from '../models/index.js';
import { calculateDeathClock, calculateImpact } from '../services/deathClock.service.js';
import { getDeviceAnalysis, getRecyclingRecommendations } from '../services/gemini.service.js';

export const createDevice = async (req, res, next) => {
  try {
    const { name, category, brand, model, purchaseDate, condition, usageHoursPerDay, location, metadata } = req.body;

    const device = await Device.create({
      userId: req.user.id,
      name, category, brand, model, purchaseDate, condition, usageHoursPerDay, location, metadata,
    });

    const deathClock = calculateDeathClock(device.toJSON());

    res.status(201).json({
      success: true,
      data: { device: device.toJSON(), deathClock },
      message: 'Device registered',
    });
  } catch (error) {
    next(error);
  }
};

export const getDevices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    if (status) where.status = status;
    if (category) where.category = category;

    const { rows: devices, count: total } = await Device.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    const items = devices.map((device) => ({
      ...device.toJSON(),
      deathClock: calculateDeathClock(device.toJSON()),
    }));

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    const deathClock = calculateDeathClock(device.toJSON());

    res.json({
      success: true,
      data: { device: device.toJSON(), deathClock },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    await device.update(req.body);
    const deathClock = calculateDeathClock(device.toJSON());

    res.json({
      success: true,
      data: { device: device.toJSON(), deathClock },
      message: 'Device updated',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    await device.destroy();

    res.json({
      success: true,
      message: 'Device deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const getDeathClock = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    const deviceData = device.toJSON();
    const deathClock = calculateDeathClock(deviceData);

    // Get AI analysis if requested
    let aiAnalysis = null;
    if (req.query.ai === 'true') {
      aiAnalysis = await getDeviceAnalysis(deviceData, deathClock);
    }

    res.json({
      success: true,
      data: { ...deathClock, aiAnalysis },
    });
  } catch (error) {
    next(error);
  }
};

export const getAIRecommendations = async (req, res, next) => {
  try {
    const device = await Device.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' },
      });
    }

    const recommendations = await getRecyclingRecommendations(device.toJSON());

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const devices = await Device.findAll({ where: { userId: req.user.id } });

    const deathClocks = devices.map((d) => calculateDeathClock(d.toJSON()));

    const totalCo2 = devices.reduce((sum, d) => sum + calculateImpact(d.toJSON()).co2Saved, 0);
    const totalEnergy = devices.reduce((sum, d) => sum + calculateImpact(d.toJSON()).energySaved, 0);
    const totalMaterials = devices.reduce((sum, d) => sum + calculateImpact(d.toJSON()).materialsRecovered, 0);

    const statusCount = deathClocks.reduce((acc, dc) => {
      acc[dc.status] = (acc[dc.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalDevices: devices.length,
        statusBreakdown: statusCount,
        avgHealthScore: deathClocks.length
          ? Math.round(deathClocks.reduce((sum, dc) => sum + dc.healthScore, 0) / deathClocks.length)
          : 0,
        impact: {
          co2Saved: parseFloat(totalCo2.toFixed(1)),
          energySaved: parseFloat(totalEnergy.toFixed(1)),
          materialsRecovered: parseFloat(totalMaterials.toFixed(1)),
        },
        recentDevices: devices.slice(0, 5).map((d) => ({
          ...d.toJSON(),
          deathClock: calculateDeathClock(d.toJSON()),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
