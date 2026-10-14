import sequelize from '../config/database.js';
import { Provider, User, RepairRequest, WasteDeposit, Notification, RepairQuote, RepairMessage } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

export const getProviders = async (req, res, next) => {
  try {
    const { type, city, search } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (search) where.businessName = { [Op.like]: `%${search}%` };

    const providers = await Provider.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
      order: [['completedJobs', 'DESC']],
    });
    res.json({ success: true, data: providers });
  } catch (e) { next(e); }
};

export const getProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
    });
    if (!provider) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: provider });
  } catch (e) { next(e); }
};

export const createProvider = async (req, res, next) => {
  try {
    if (!['repair_provider', 'recycler', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Must apply and be approved for a provider role before creating a provider profile' },
      });
    }
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
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'city'] },
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'businessName', 'city'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
        },
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

export const getRepairRequest = async (req, res, next) => {
  try {
    const repairReq = await RepairRequest.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'city'] },
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'businessName', 'city', 'phone'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
        },
      ],
    });
    if (!repairReq) return res.status(404).json({ success: false, error: { message: 'Not found' } });

    res.json({ success: true, data: repairReq });
  } catch (e) { next(e); }
};

export const submitRepairQuote = async (req, res, next) => {
  try {
    // SECURITY: Only verified repair providers or admins can submit quotes
    const provider = await Provider.findOne({ where: { userId: req.user.id } });
    if (!provider || (provider.verificationStatus !== 'admin_verified' && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only verified repair providers can submit quotes' },
      });
    }

    const repairRequestId = req.params.id;
    const repairReq = await RepairRequest.findByPk(repairRequestId);
    if (!repairReq) return res.status(404).json({ success: false, error: { message: 'Repair request not found' } });

    const {
      inspectionFee,
      estimatedPriceMin,
      estimatedPriceMax,
      partsAssumptions,
      estimatedTime,
      warrantyTerms,
      notes,
    } = req.body;

    if (estimatedPriceMin === undefined || estimatedPriceMax === undefined || !estimatedTime) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'estimatedPriceMin, estimatedPriceMax, and estimatedTime are required' },
      });
    }

    const [quote, created] = await RepairQuote.findOrCreate({
      where: { repairRequestId, providerId: provider.id },
      defaults: {
        inspectionFee: inspectionFee || 0,
        estimatedPriceMin,
        estimatedPriceMax,
        partsAssumptions,
        estimatedTime,
        warrantyTerms,
        notes,
        status: 'pending',
      },
    });

    if (!created) {
      await quote.update({
        inspectionFee: inspectionFee || 0,
        estimatedPriceMin,
        estimatedPriceMax,
        partsAssumptions,
        estimatedTime,
        warrantyTerms,
        notes,
        status: 'pending',
      });
    }

    // Notify the customer
    await Notification.create({
      userId: repairReq.userId,
      type: 'repair_quote',
      title: 'New Repair Quote Received',
      body: `${provider.businessName} offered a quote for "${repairReq.itemName}": Rp ${Number(estimatedPriceMin).toLocaleString()} - Rp ${Number(estimatedPriceMax).toLocaleString()}`,
      link: `/repair`,
    });

    res.status(201).json({
      success: true,
      data: quote,
      message: 'Quote submitted successfully',
    });
  } catch (e) { next(e); }
};

export const getRepairQuotes = async (req, res, next) => {
  try {
    const repairRequestId = req.params.id;
    const repairReq = await RepairRequest.findByPk(repairRequestId);
    if (!repairReq) return res.status(404).json({ success: false, error: { message: 'Repair request not found' } });

    const isOwner = req.user.id === repairReq.userId;
    const provider = await Provider.findOne({ where: { userId: req.user.id, verificationStatus: 'admin_verified' } });
    const isAdmin = req.user.role === 'admin';

    // Access control: only owner, admin, or the quoting verified provider can view quotes
    if (!isOwner && !provider && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const where = { repairRequestId };
    // If provider is requesting, only show THEIR quote! Competing providers cannot see each other's quotes!
    if (!isOwner && !isAdmin && provider) {
      where.providerId = provider.id;
    }

    const quotes = await RepairQuote.findAll({
      where,
      include: [
        {
          model: Provider,
          as: 'provider',
          attributes: ['id', 'businessName', 'city', 'phone', 'ratingSum', 'ratingCount', 'completedJobs'],
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: quotes });
  } catch (e) { next(e); }
};

export const acceptRepairQuote = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id: repairRequestId, quoteId } = req.params;
    const repairReq = await RepairRequest.findByPk(repairRequestId, { transaction });
    if (!repairReq) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: { message: 'Repair request not found' } });
    }

    // Only owner can accept
    if (req.user.id !== repairReq.userId) {
      await transaction.rollback();
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the request owner can accept quotes' } });
    }

    if (['completed', 'cancelled'].includes(repairReq.status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: `Cannot accept quotes on a ${repairReq.status} repair request` } });
    }

    const quote = await RepairQuote.findOne({ where: { id: quoteId, repairRequestId }, transaction });
    if (!quote) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: { message: 'Quote not found' } });
    }

    if (quote.status === 'withdrawn') {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Cannot accept a withdrawn quote' } });
    }

    // Mark this quote accepted, reject others
    await quote.update({ status: 'accepted' }, { transaction });
    await RepairQuote.update(
      { status: 'rejected' },
      { where: { repairRequestId, id: { [Op.ne]: quote.id } }, transaction }
    );

    // Update repair request
    await repairReq.update({
      providerId: quote.providerId,
      estimatedCost: quote.estimatedPriceMin,
      estimatedTime: quote.estimatedTime,
      status: 'accepted',
    }, { transaction });

    await transaction.commit();

    // Notify provider
    const provider = await Provider.findByPk(quote.providerId);
    if (provider) {
      await Notification.create({
        userId: provider.userId,
        type: 'quote_accepted',
        title: 'Quote Accepted! 🎉',
        body: `Customer accepted your repair quote for "${repairReq.itemName}"`,
        link: '/repair-provider',
      });
    }

    res.json({
      success: true,
      data: { quote, repairRequest: repairReq },
      message: 'Quote accepted successfully',
    });
  } catch (e) {
    await transaction.rollback();
    next(e);
  }
};

export const getRepairMessages = async (req, res, next) => {
  try {
    const repairRequestId = req.params.id;
    const repairReq = await RepairRequest.findByPk(repairRequestId);
    if (!repairReq) return res.status(404).json({ success: false, error: { message: 'Repair request not found' } });

    const isOwner = req.user.id === repairReq.userId;
    const provider = await Provider.findOne({ where: { userId: req.user.id, verificationStatus: 'admin_verified' } });
    const isAdmin = req.user.role === 'admin';

    // Must be either request owner, participating verified provider, or admin
    if (!isOwner && !provider && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    const where = { repairRequestId };
    if (!isOwner && !isAdmin && provider) {
      // Provider only sees conversation involving their provider ID
      where.providerId = provider.id;
    } else if (isOwner && req.query.providerId) {
      where.providerId = req.query.providerId;
    }

    const messages = await RepairMessage.findAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.json({ success: true, data: messages });
  } catch (e) { next(e); }
};

export const sendRepairMessage = async (req, res, next) => {
  try {
    const repairRequestId = req.params.id;
    const { message, attachments } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Message text is required' } });
    }

    const repairReq = await RepairRequest.findByPk(repairRequestId);
    if (!repairReq) return res.status(404).json({ success: false, error: { message: 'Repair request not found' } });

    const isOwner = req.user.id === repairReq.userId;
    const provider = await Provider.findOne({ where: { userId: req.user.id, verificationStatus: 'admin_verified' } });
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !provider && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot message on this ticket' } });
    }

    let conversationProviderId;
    let actualReceiverId;

    if (provider) {
      conversationProviderId = provider.id;
      actualReceiverId = repairReq.userId;
    } else if (isOwner) {
      conversationProviderId = req.body.providerId || repairReq.providerId;
      if (!conversationProviderId) {
        return res.status(400).json({ success: false, error: { message: 'Target providerId is required' } });
      }
      const targetProv = await Provider.findByPk(conversationProviderId);
      if (!targetProv) {
        return res.status(404).json({ success: false, error: { message: 'Provider not found' } });
      }
      actualReceiverId = targetProv.userId;
    } else if (isAdmin) {
      conversationProviderId = req.body.providerId || repairReq.providerId;
      actualReceiverId = req.body.receiverId || repairReq.userId;
    }

    if (!actualReceiverId) {
      return res.status(400).json({ success: false, error: { message: 'Receiver could not be determined' } });
    }

    const newMessage = await RepairMessage.create({
      repairRequestId,
      providerId: conversationProviderId || null,
      senderId: req.user.id,
      receiverId: actualReceiverId,
      message: message.trim(),
      attachments: attachments || [],
    });

    // Notify recipient
    await Notification.create({
      userId: actualReceiverId,
      type: 'repair_message',
      title: `Message about ${repairReq.itemName}`,
      body: `${req.user.name}: ${message.trim().slice(0, 80)}`,
      link: `/repair`,
    });

    const fullMessage = await RepairMessage.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
      ],
    });

    res.status(201).json({ success: true, data: fullMessage });
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
