import { User, Provider, WasteDeposit, RepairRequest, Challenge, Event, Notification, Device } from '../models/index.js';
import { Op } from 'sequelize';

const requireRecycler = (req, res) => {
  if (!['admin', 'recycler'].includes(req.user.role)) {
    res.status(403).json({ success: false, error: { message: 'Recycler or Admin only' } });
    return false;
  }
  return true;
};

// Dashboard Overview
export const getRecyclerDashboard = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, error: { message: 'Provider profile not found' } });
    }

    const providerId = provider?.id;

    const [
      totalCollected,
      pendingRequests,
      upcomingPickups,
      completedRecycling,
      totalWeight
    ] = await Promise.all([
      WasteDeposit.count({ where: { providerId } }),
      RepairRequest.count({ where: { providerId, status: 'requested' } }),
      RepairRequest.count({ where: { providerId, status: 'accepted' } }),
      WasteDeposit.count({ where: { providerId, ecoKarmaAwarded: true } }),
      WasteDeposit.sum('weightKg', { where: { providerId } })
    ]);

    const recentCollections = await WasteDeposit.findAll({
      where: { providerId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalCollected: totalCollected || 0,
          pendingRequests: pendingRequests || 0,
          upcomingPickups: upcomingPickups || 0,
          completedRecycling: completedRecycling || 0,
          totalWeightKg: parseFloat(totalWeight || 0).toFixed(2)
        },
        recentCollections,
        provider
      }
    });
  } catch (e) { next(e); }
};

// Get Recycling Requests
export const getRecyclingRequests = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (provider) where.providerId = provider.id;

    const { rows, count } = await RepairRequest.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Accept/Reject Request
export const handleRecyclingRequest = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const { action, estimatedCost, scheduledDate } = req.body;
    const request = await RepairRequest.findByPk(req.params.id);

    if (!request) return res.status(404).json({ success: false, error: { message: 'Request not found' } });

    if (action === 'accept') {
      await request.update({
        status: 'accepted',
        estimatedCost: estimatedCost || request.estimatedCost,
        scheduledDate: scheduledDate || null
      });

      await Notification.create({
        userId: request.userId,
        type: 'recycling',
        title: 'Recycling Request Accepted',
        body: `Your recycling request has been accepted${estimatedCost ? ` with estimated cost: ${estimatedCost}` : ''}`,
        link: `/repair`
      });
    } else if (action === 'reject') {
      await request.update({ status: 'rejected' });

      await Notification.create({
        userId: request.userId,
        type: 'recycling',
        title: 'Recycling Request Declined',
        body: 'Your recycling request has been declined',
        link: `/repair`
      });
    }

    res.json({ success: true, data: request, message: `Request ${action}ed successfully` });
  } catch (e) { next(e); }
};

// Get Pickups
export const getPickups = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { status } = req.query;
    const where = { providerId: provider?.id };

    if (status) where.status = status;

    const pickups = await RepairRequest.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone', 'address', 'city'] }],
      order: [['scheduledDate', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({ success: true, data: pickups });
  } catch (e) { next(e); }
};

// Update Pickup Status
export const updatePickupStatus = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const { status } = req.body;
    const request = await RepairRequest.findByPk(req.params.id);

    if (!request) return res.status(404).json({ success: false, error: { message: 'Pickup not found' } });

    await request.update({ status });

    if (status === 'completed') {
      await request.update({ completedAt: new Date(), ecoKarmaAwarded: true });

      await Notification.create({
        userId: request.userId,
        type: 'recycling',
        title: 'Pickup Completed',
        body: 'Your e-waste has been successfully collected!',
        link: `/repair`
      });
    }

    res.json({ success: true, data: request, message: 'Pickup status updated' });
  } catch (e) { next(e); }
};

// Get Collected E-Waste
export const getCollectedWaste = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { page = 1, limit = 20 } = req.query;

    const { rows, count } = await WasteDeposit.findAndCountAll({
      where: { providerId: provider?.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['depositDate', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Record Collection
export const recordCollection = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const { userId, material, weightKg, pricePerKg, notes } = req.body;

    const deposit = await WasteDeposit.create({
      userId,
      providerId: provider.id,
      material,
      weightKg: parseFloat(weightKg),
      pricePerKg: parseFloat(pricePerKg || 0),
      totalValue: parseFloat(weightKg) * parseFloat(pricePerKg || 0),
      depositDate: new Date(),
      ecoKarmaAwarded: true,
      notes
    });

    await Notification.create({
      userId,
      type: 'recycling',
      title: 'E-Waste Collection Recorded',
      body: `${weightKg}kg of ${material} has been recorded`,
      link: `/impact`
    });

    res.status(201).json({ success: true, data: deposit, message: 'Collection recorded successfully' });
  } catch (e) { next(e); }
};

// Get Collection Drives
export const getCollectionDrives = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const drives = await Challenge.findAll({
      where: { category: { [Op.in]: ['ewaste', 'recycling'] } },
      include: [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'role'] }],
      order: [['startDate', 'DESC']]
    });

    res.json({ success: true, data: drives });
  } catch (e) { next(e); }
};

// Get Organizations & Businesses
export const getOrganizations = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const organizations = await User.findAll({
      where: { role: { [Op.in]: ['organization', 'business'] } },
      attributes: ['id', 'name', 'email', 'phone', 'city', 'role', 'ecoKarmaTotal', 'verificationStatus']
    });

    res.json({ success: true, data: organizations });
  } catch (e) { next(e); }
};

// Get Impact Analytics
export const getRecyclerImpact = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });

    const [totalWeight, totalDeposits, totalUsers, materialBreakdown] = await Promise.all([
      WasteDeposit.sum('weightKg', { where: { providerId: provider?.id } }),
      WasteDeposit.count({ where: { providerId: provider?.id } }),
      WasteDeposit.count({
        where: { providerId: provider?.id },
        distinct: true,
        col: 'userId'
      }),
      WasteDeposit.findAll({
        where: { providerId: provider?.id },
        attributes: [
          'material',
          [require('sequelize').fn('SUM', require('sequelize').col('weightKg')), 'totalWeight'],
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['material'],
        raw: true
      })
    ]);

    const co2Saved = (parseFloat(totalWeight || 0) * 2.5).toFixed(2); // Approximate calculation
    const treesEquivalent = Math.round((parseFloat(totalWeight || 0) / 10));

    res.json({
      success: true,
      data: {
        totalWeightKg: parseFloat(totalWeight || 0).toFixed(2),
        totalDeposits: totalDeposits || 0,
        totalUsers: totalUsers || 0,
        co2SavedKg: co2Saved,
        treesEquivalent,
        materialBreakdown
      }
    });
  } catch (e) { next(e); }
};

// Update Profile
export const updateRecyclerProfile = async (req, res, next) => {
  try {
    if (!requireRecycler(req, res)) return;

    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) {
      return res.status(404).json({ success: false, error: { message: 'Provider profile not found' } });
    }

    const allowed = ['businessName', 'description', 'address', 'city', 'province', 'phone', 'whatsapp', 'email', 'website', 'serviceRadius', 'acceptedMaterials', 'specializations'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await provider.update(updates);

    res.json({ success: true, data: provider, message: 'Profile updated successfully' });
  } catch (e) { next(e); }
};

export default {
  getRecyclerDashboard,
  getRecyclingRequests,
  handleRecyclingRequest,
  getPickups,
  updatePickupStatus,
  getCollectedWaste,
  recordCollection,
  getCollectionDrives,
  getOrganizations,
  getRecyclerImpact,
  updateRecyclerProfile
};
