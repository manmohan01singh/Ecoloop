import { BusinessMaterial, MaterialRequest, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

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
