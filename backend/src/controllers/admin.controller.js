import { User, Post, Community, Listing, Provider, Location, Report, Challenge, Event, EcoKarma, WasteDeposit, RepairRequest, Device } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

const requireAdmin = (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: { message: 'Admin only' } });
    return false;
  }
  return true;
};

export const getDashboard = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const [users, posts, listings, reports, providers, locations] = await Promise.all([
      User.count(),
      Post.count(),
      Listing.count(),
      Report.count({ where: { status: { [Op.in]: ['reported', 'under_review'] } } }),
      Provider.count({ where: { verificationStatus: 'unverified' } }),
      Location.count({ where: { verificationStatus: 'unverified' } }),
    ]);
    const recentUsers = await User.findAll({ order: [['createdAt', 'DESC']], limit: 5, attributes: ['id', 'name', 'email', 'role', 'createdAt'] });
    res.json({ success: true, data: { stats: { users, posts, listings, pendingReports: reports, pendingProviders: providers, pendingLocations: locations }, recentUsers } });
  } catch (e) { next(e); }
};

export const getUsers = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { search, role, page = 1, limit = 20 } = req.query;
    const where = {};
    if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }];
    if (role) where.role = role;
    const { rows, count } = await User.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), attributes: { exclude: ['password'] } });
    res.json({ success: true, data: { items: rows, total: count } });
  } catch (e) { next(e); }
};

export const updateUser = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    const allowed = ['role', 'verificationStatus'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    await user.update(updates);
    res.json({ success: true, data: user.toJSON() });
  } catch (e) { next(e); }
};

export const moderatePost = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await post.update({ isRemoved: req.body.isRemoved });
    res.json({ success: true, data: post });
  } catch (e) { next(e); }
};

export const verifyProvider = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const provider = await Provider.findByPk(req.params.id);
    if (!provider) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await provider.update({ verificationStatus: req.body.status });
    res.json({ success: true, data: provider });
  } catch (e) { next(e); }
};

export const verifyLocationAdmin = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const location = await Location.findByPk(req.params.id);
    if (!location) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await location.update({ verificationStatus: req.body.status, verifiedById: req.user.id });
    res.json({ success: true, data: location });
  } catch (e) { next(e); }
};

export const getPendingLocations = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const locations = await Location.findAll({ where: { verificationStatus: 'unverified' }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: locations });
  } catch (e) { next(e); }
};

export const getPendingProviders = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const providers = await Provider.findAll({ where: { verificationStatus: 'unverified' }, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }], order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: providers });
  } catch (e) { next(e); }
};

export const getPendingReports = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    const reports = await Report.findAll({ where: { status: { [Op.in]: ['reported', 'under_review', 'verified'] } }, include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }], order: [['upvotes', 'DESC']] });
    res.json({ success: true, data: reports });
  } catch (e) { next(e); }
};

export const getOrganizationStats = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });
    
    // Only allow organization users to access their own data, or admins to access any
    if (user.role !== 'organization') {
      return res.status(403).json({ success: false, error: { message: 'This endpoint is for organization users only' } });
    }
    
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Access denied' } });
    }

    const [challengesCreated, eventsHosted, challengeParticipants, eventParticipants] = await Promise.all([
      Challenge.findAll({ 
        where: { createdById: userId },
        attributes: ['id', 'title', 'status', 'goalType', 'goalValue', 'currentValue', 'participantCount', 'createdAt']
      }),
      Event.findAll({ 
        where: { createdById: userId },
        attributes: ['id', 'title', 'status', 'startDate', 'endDate', 'participantCount', 'capacity', 'createdAt']
      }),
      Challenge.sum('participantCount', { where: { createdById: userId } }),
      Event.sum('participantCount', { where: { createdById: userId } })
    ]);

    const totalParticipants = (challengeParticipants || 0) + (eventParticipants || 0);
    const activeChallenges = challengesCreated.filter(c => c.status === 'active').length;
    const completedChallenges = challengesCreated.filter(c => c.status === 'completed').length;
    const upcomingEvents = eventsHosted.filter(e => e.status === 'upcoming').length;
    const completedEvents = eventsHosted.filter(e => e.status === 'completed').length;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          ecoKarmaTotal: user.ecoKarmaTotal,
          verificationStatus: user.verificationStatus
        },
        stats: {
          challengesCreated: challengesCreated.length,
          activeChallenges,
          completedChallenges,
          eventsHosted: eventsHosted.length,
          upcomingEvents,
          completedEvents,
          totalParticipants: parseInt(totalParticipants)
        },
        challenges: challengesCreated,
        events: eventsHosted
      }
    });
  } catch (e) { next(e); }
};

export const getUserContributions = async (req, res, next) => {
  try {
    if (!requireAdmin(req, res)) return;
    
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const [posts, devices, listings, deposits, repairs, karmaLogs] = await Promise.all([
      Post.count({ where: { authorId: userId } }),
      Device.count({ where: { userId } }),
      Listing.count({ where: { userId } }),
      WasteDeposit.count({ where: { userId } }),
      RepairRequest.count({ where: { userId } }),
      EcoKarma.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 10 })
    ]);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ecoKarmaTotal: user.ecoKarmaTotal,
          verificationStatus: user.verificationStatus,
          createdAt: user.createdAt
        },
        contributions: {
          posts,
          devices,
          listings,
          wasteDeposits: deposits,
          repairRequests: repairs
        },
        recentKarma: karmaLogs
      }
    });
  } catch (e) { next(e); }
};
