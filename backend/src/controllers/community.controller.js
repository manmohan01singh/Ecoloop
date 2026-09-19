import { Community, CommunityMember, Post, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getCommunities = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;

    const { rows, count } = await Community.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['memberCount', 'DESC']],
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

export const getCommunity = async (req, res, next) => {
  try {
    const community = await Community.findOne({
      where: { slug: req.params.slug },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }],
    });
    if (!community) return res.status(404).json({ success: false, error: { message: 'Community not found' } });

    let isMember = false;
    let memberRole = null;
    if (req.user) {
      const membership = await CommunityMember.findOne({ where: { communityId: community.id, userId: req.user.id } });
      isMember = !!membership;
      memberRole = membership?.role || null;
    }
    res.json({ success: true, data: { ...community.toJSON(), isMember, memberRole } });
  } catch (e) { next(e); }
};

export const createCommunity = async (req, res, next) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 100);

    const exists = await Community.findOne({ where: { slug } });
    if (exists) return res.status(409).json({ success: false, error: { message: 'Community name taken' } });

    const community = await Community.create({ name, slug, description, category, isPrivate, createdById: req.user.id });
    await CommunityMember.create({ communityId: community.id, userId: req.user.id, role: 'admin' });
    await community.increment('memberCount');

    res.status(201).json({ success: true, data: community, message: 'Community created' });
  } catch (e) { next(e); }
};

export const joinCommunity = async (req, res, next) => {
  try {
    const community = await Community.findByPk(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: { message: 'Community not found' } });

    const existing = await CommunityMember.findOne({ where: { communityId: community.id, userId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Already a member' } });

    await CommunityMember.create({ communityId: community.id, userId: req.user.id });
    await community.increment('memberCount');

    res.json({ success: true, message: 'Joined community' });
  } catch (e) { next(e); }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    const membership = await CommunityMember.findOne({ where: { communityId: req.params.id, userId: req.user.id } });
    if (!membership) return res.status(404).json({ success: false, error: { message: 'Not a member' } });

    await membership.destroy();
    await Community.decrement('memberCount', { where: { id: req.params.id } });

    res.json({ success: true, message: 'Left community' });
  } catch (e) { next(e); }
};

export const updateCommunity = async (req, res, next) => {
  try {
    const community = await Community.findByPk(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: { message: 'Community not found' } });

    const membership = await CommunityMember.findOne({ where: { communityId: community.id, userId: req.user.id } });
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Only admins can update' } });
    }

    const { description, coverImage, icon, rules, isPrivate } = req.body;
    await community.update({
      description: description !== undefined ? description : community.description,
      coverImage: coverImage !== undefined ? coverImage : community.coverImage,
      icon: icon !== undefined ? icon : community.icon,
      rules: rules !== undefined ? rules : community.rules,
      isPrivate: isPrivate !== undefined ? isPrivate : community.isPrivate,
    });

    res.json({ success: true, data: community, message: 'Community updated' });
  } catch (e) { next(e); }
};

export const getMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { rows, count } = await CommunityMember.findAndCountAll({
      where: { communityId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'ecoKarmaTotal'] }],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['joinedAt', 'ASC']],
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};
