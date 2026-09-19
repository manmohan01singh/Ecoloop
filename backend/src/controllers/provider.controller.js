import { Provider, User, RepairRequest, WasteDeposit, Notification } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

export const getProviders = async (req, res, next) => {
  try {
    const { type, city, search } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (search) where.businessName = { [Op.iLike]: `%${search}%` };

    const providers = await Provider.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      order: [['completedJobs', 'DESC']],
    });
    res.json({ success: true, data: providers });
  } catch (e) { next(e); }
};

export const getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });
    if (!provider) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: provider });
  } catch (e) { next(e); }
};

export const createProvider = async (req, res, next) => {
  try {
    const existing = await Provider.findOne({ where: { userId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Provider profile exists' } });
    const provider = await Provider.create({ userId: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: provider });
  } catch (e) { next(e); }
};

export const updateProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await provider.update(req.body);
    res.json({ success: true, data: provider });
  } catch (e) { next(e); }
};

// ── Repair Requests ────────────────────────────────────────────
export const getRepairRequests = async (req, res, next) => {
  try {
    const { status, city, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (city) where.city = { [Op.iLike]: `%${city}%` };

    const { rows, count } = await RepairRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'city'] },
        { model: Provider, as: 'provider', attributes: ['id', 'businessName', 'city'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: { items: rows, total: count } });
  } catch (e) { next(e); }
};

export const createRepairRequest = async (req, res, next) => {
  try {
    const { itemName, category, description, images, city } = req.body;
    const request = await RepairRequest.create({
      userId: req.user.id, itemName, category, description, images: images || [], city,
    });
    res.status(201).json({ success: true, data: request, message: 'Repair request submitted' });
  } catch (e) { next(e); }
};

export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status, estimatedCost } = req.body;
    const repairReq = await RepairRequest.findByPk(req.params.id, {
      include: [{ model: Provider, as: 'provider' }],
    });
    if (!repairReq) return res.status(404).json({ success: false, error: { message: 'Not found' } });

    // Only provider or owner can update
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    const isOwner = repairReq.userId === req.user.id;
    const isProvider = provider && repairReq.providerId === provider.id;
    if (!isOwner && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }

    const updates = { status };
    if (estimatedCost) updates.estimatedCost = estimatedCost;
    if (status === 'completed') updates.completedAt = new Date();
    if (status === 'accepted' && provider) updates.providerId = provider.id;

    await repairReq.update(updates);

    if (status === 'completed' && !repairReq.ecoKarmaAwarded) {
      await awardKarma(repairReq.userId, 'repair_completed', `Repair completed: ${repairReq.itemName}`);
      if (repairReq.providerId) {
        const p = await Provider.findByPk(repairReq.providerId);
        if (p) { await p.increment('completedJobs'); await awardKarma(p.userId, 'repair_completed', 'Completed a repair job'); }
      }
      await repairReq.update({ ecoKarmaAwarded: true });
    }

    await Notification.create({
      userId: repairReq.userId, type: 'repair_update',
      title: `Repair request status: ${status}`,
      body: `Your repair request for "${repairReq.itemName}" is now ${status}`,
      link: `/repair/${repairReq.id}`,
    });

    res.json({ success: true, data: repairReq });
  } catch (e) { next(e); }
};

// ── Waste Deposits ─────────────────────────────────────────────
export const recordDeposit = async (req, res, next) => {
  try {
    const { providerId, material, weightKg, depositDate, notes } = req.body;
    const provider = await Provider.findByPk(providerId);
    if (!provider || provider.type !== 'waste_bank') {
      return res.status(400).json({ success: false, error: { message: 'Invalid waste bank' } });
    }
    const pricePerKg = req.body.pricePerKg || 0;
    const totalValue = weightKg * pricePerKg;

    const deposit = await WasteDeposit.create({
      userId: req.user.id, providerId, material, weightKg, pricePerKg, totalValue,
      depositDate: depositDate || new Date(), notes,
    });

    await awardKarma(req.user.id, 'recycling_deposit', `Deposited ${weightKg}kg of ${material}`, deposit.id, 'WasteDeposit');
    await deposit.update({ ecoKarmaAwarded: true });

    res.status(201).json({ success: true, data: deposit, message: 'Deposit recorded' });
  } catch (e) { next(e); }
};

export const getMyDeposits = async (req, res, next) => {
  try {
    const deposits = await WasteDeposit.findAll({
      where: { userId: req.user.id },
      include: [{ model: Provider, as: 'provider', attributes: ['id', 'businessName', 'city'] }],
      order: [['depositDate', 'DESC']],
    });
    const totalKg = deposits.reduce((s, d) => s + parseFloat(d.weightKg), 0);
    const totalValue = deposits.reduce((s, d) => s + parseFloat(d.totalValue), 0);
    res.json({ success: true, data: { deposits, totalKg: parseFloat(totalKg.toFixed(2)), totalValue: parseFloat(totalValue.toFixed(2)) } });
  } catch (e) { next(e); }
};
