import { BusinessMaterial, MaterialRequest, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';
import sequelize from '../models/index.js';

// ===== BUSINESS DASHBOARD =====
export const getBusinessDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get statistics
    const [myMaterials, incomingRequests, outgoingRequests] = await Promise.all([
      BusinessMaterial.findAll({ where: { userId }, attributes: ['status', 'price', 'quantity'] }),
      MaterialRequest.findAll({
        include: [{ model: BusinessMaterial, as: 'material', where: { userId }, attributes: ['id'] }],
        attributes: ['status']
      }),
      MaterialRequest.findAll({
        where: { requesterId: userId },
        attributes: ['status']
      })
    ]);

    const stats = {
      activeListings: myMaterials.filter(m => m.status === 'listed').length,
      incomingRequests: incomingRequests.filter(r => r.status === 'pending').length,
      outgoingRequests: outgoingRequests.filter(r => r.status === 'pending').length,
      completedDeals: myMaterials.filter(m => m.status === 'completed').length,
      totalListedValue: myMaterials
        .filter(m => m.status === 'listed')
        .reduce((sum, m) => sum + (parseFloat(m.price) * parseFloat(m.quantity)), 0),
      totalRevenue: myMaterials
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + (parseFloat(m.price) * parseFloat(m.quantity)), 0),
    };

    // Get recent activity
    const recentListings = await BusinessMaterial.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: MaterialRequest, as: 'requests', limit: 3 }]
    });

    // Get pending requests (both incoming and outgoing)
    const pendingIncoming = await MaterialRequest.findAll({
      where: { status: 'pending' },
      include: [
        { model: BusinessMaterial, as: 'material', where: { userId } },
        { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const pendingOutgoing = await MaterialRequest.findAll({
      where: { requesterId: userId, status: 'pending' },
      include: [
        { model: BusinessMaterial, as: 'material', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        stats,
        recentListings,
        pendingIncoming,
        pendingOutgoing
      }
    });
  } catch (e) {
    next(e);
  }
};

// Get analytics data
export const getBusinessAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    // Get materials grouped by type
    const materialsByType = await BusinessMaterial.findAll({
      where: { userId, createdAt: { [Op.gte]: startDate } },
      attributes: [
        'materialType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
      ],
      group: ['materialType'],
      raw: true
    });

    // Get revenue over time
    const revenueByMonth = await BusinessMaterial.findAll({
      where: {
        userId,
        status: 'completed',
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'month'],
        [sequelize.fn('SUM', sequelize.literal('price * quantity')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'deals']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Top partners (businesses I've traded with most)
    const topPartners = await MaterialRequest.findAll({
      where: { requesterId: userId, status: 'completed' },
      include: [{
        model: BusinessMaterial,
        as: 'material',
        attributes: ['companyName'],
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }]
      }],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('MaterialRequest.id')), 'tradeCount']
      ],
      group: ['material.id', 'material.companyName', 'material->user.id', 'material->user.name', 'material->user.avatar'],
      order: [[sequelize.fn('COUNT', sequelize.col('MaterialRequest.id')), 'DESC']],
      limit: 5,
      raw: true
    });

    res.json({
      success: true,
      data: {
        materialsByType,
        revenueByMonth,
        topPartners,
        period
      }
    });
  } catch (e) {
    next(e);
  }
};

// Get all my requests (materials I want to acquire)
export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await MaterialRequest.findAll({
      where: { requesterId: req.user.id },
      include: [
        {
          model: BusinessMaterial,
          as: 'material',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: requests });
  } catch (e) {
    next(e);
  }
};

// Update my own material listing
export const updateMaterial = async (req, res, next) => {
  try {
    const material = await BusinessMaterial.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: { message: 'Material not found or unauthorized' } });
    }

    await material.update(req.body);
    res.json({ success: true, data: material });
  } catch (e) {
    next(e);
  }
};

// Delete material listing
export const deleteMaterial = async (req, res, next) => {
  try {
    const material = await BusinessMaterial.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!material) {
      return res.status(404).json({ success: false, error: { message: 'Material not found or unauthorized' } });
    }

    await material.destroy();
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (e) {
    next(e);
  }
};

// ===== EXISTING FUNCTIONS =====
export const getMaterials = async (req, res, next) => {
  try {
    const { materialType, city, isFree, status = 'listed', search, page = 1, limit = 20 } = req.query;
    const where = { status };
    if (materialType) where.materialType = materialType;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (isFree !== undefined) where.isFree = isFree === 'true';
    if (search) where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { companyName: { [Op.iLike]: `%${search}%` } },
    ];

    const { rows, count } = await BusinessMaterial.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: { items: rows, total: count } });
  } catch (e) { next(e); }
};

export const getMaterial = async (req, res, next) => {
  try {
    const mat = await BusinessMaterial.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
        { model: MaterialRequest, as: 'requests', include: [{ model: User, as: 'requester', attributes: ['id', 'name'] }] },
      ],
    });
    if (!mat) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    res.json({ success: true, data: mat });
  } catch (e) { next(e); }
};

export const createMaterial = async (req, res, next) => {
  try {
    const mat = await BusinessMaterial.create({ userId: req.user.id, ...req.body });
    res.status(201).json({ success: true, data: mat });
  } catch (e) { next(e); }
};

export const requestMaterial = async (req, res, next) => {
  try {
    const mat = await BusinessMaterial.findByPk(req.params.id);
    if (!mat || mat.status !== 'listed') return res.status(400).json({ success: false, error: { message: 'Material not available' } });
    if (mat.userId === req.user.id) return res.status(400).json({ success: false, error: { message: 'Cannot request your own listing' } });

    const existing = await MaterialRequest.findOne({ where: { materialId: mat.id, requesterId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Already requested' } });

    const request = await MaterialRequest.create({ materialId: mat.id, requesterId: req.user.id, ...req.body });
    await mat.increment('requestCount');

    await Notification.create({
      userId: mat.userId, type: 'listing_request',
      title: `New request for "${mat.title}"`,
      body: req.body.message || 'A business is interested in your material',
      link: `/business-exchange/${mat.id}`,
    });

    res.status(201).json({ success: true, data: request });
  } catch (e) { next(e); }
};

export const updateMaterialRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await MaterialRequest.findByPk(req.params.requestId, {
      include: [{ model: BusinessMaterial, as: 'material' }],
    });
    if (!request) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    if (request.material.userId !== req.user.id) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

    await request.update({ status, completedAt: status === 'completed' ? new Date() : null });

    if (status === 'completed') {
      await request.material.update({ status: 'completed' });
      await awardKarma(request.material.userId, 'material_exchange', `Material exchange completed: ${request.material.title}`);
      await awardKarma(request.requesterId, 'material_exchange', `Received material: ${request.material.title}`);
    } else if (status === 'accepted') {
      await request.material.update({ status: 'requested' });
    }

    // Notify requester
    await Notification.create({
      userId: request.requesterId,
      type: 'request_status',
      title: `Request ${status}`,
      body: `Your request for "${request.material.title}" has been ${status}`,
      link: `/business-exchange/${request.material.id}`,
    });

    res.json({ success: true, data: request });
  } catch (e) { next(e); }
};

export const getMyMaterials = async (req, res, next) => {
  try {
    const materials = await BusinessMaterial.findAll({
      where: { userId: req.user.id },
      include: [{ model: MaterialRequest, as: 'requests', include: [{ model: User, as: 'requester', attributes: ['id', 'name'] }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: materials });
  } catch (e) { next(e); }
};
