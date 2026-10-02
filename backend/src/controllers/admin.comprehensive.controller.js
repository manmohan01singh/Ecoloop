import { Op } from 'sequelize';
import sequelize from '../models/index.js';
import {
  User, Provider, Device, Post, Listing, Location, Challenge, Event,
  BusinessMaterial, MaterialRequest, RepairRequest, WasteDeposit,
  Report, Review, Notification, EcoKarma, CommunityMember, ChallengeParticipant,
  EventParticipant, Comment, PostVote
} from '../models/index.js';

// ===== COMPREHENSIVE ADMIN DASHBOARD =====
export const getComprehensiveAdminDashboard = async (req, res, next) => {
  try {
    // Get all statistics in parallel
    const [
      // User stats
      totalUsers,
      adminUsers,
      moderatorUsers,
      recyclerUsers,
      repairProviderUsers,
      businessUsers,
      organizationUsers,
      regularUsers,
      
      // Content stats
      totalPosts,
      totalComments,
      totalDevices,
      totalListings,
      totalLocations,
      totalCommunities,
      
      // Business stats
      totalMaterials,
      totalMaterialRequests,
      activeMaterialListings,
      completedDeals,
      
      // Organization stats
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalEvents,
      upcomingEvents,
      completedEvents,
      
      // Repair provider stats
      totalRepairRequests,
      activeRepairs,
      completedRepairs,
      
      // Recycler stats
      totalWasteDeposits,
      verifiedDeposits,
      totalWasteKg,
      
      // Moderation stats
      totalReports,
      pendingReports,
      resolvedReports,
      
      // Engagement stats
      totalReviews,
      totalKarmaActivities,
      totalNotifications,
      
      // Pending verification
      pendingProviders,
      pendingLocations,
      
      // Recent activity
      recentUsers,
      recentPosts,
      recentMaterials,
      recentChallenges,
      recentEvents,
      recentRepairs,
      recentReports
      
    ] = await Promise.all([
      // User counts
      User.count(),
      User.count({ where: { role: 'admin' } }),
      User.count({ where: { role: 'moderator' } }),
      User.count({ where: { role: 'recycler' } }),
      User.count({ where: { role: 'repair_provider' } }),
      User.count({ where: { role: 'business' } }),
      User.count({ where: { role: 'organization' } }),
      User.count({ where: { role: 'user' } }),
      
      // Content counts
      Post.count(),
      Comment.count(),
      Device.count(),
      Listing.count(),
      Location.count(),
      User.count({ where: { role: 'organization' } }), // Communities count
      
      // Business counts
      BusinessMaterial.count(),
      MaterialRequest.count(),
      BusinessMaterial.count({ where: { status: 'listed' } }),
      BusinessMaterial.count({ where: { status: 'completed' } }),
      
      // Organization counts
      Challenge.count(),
      Challenge.count({ where: { status: 'active' } }),
      Challenge.count({ where: { status: 'completed' } }),
      Event.count(),
      Event.count({ where: { status: 'upcoming' } }),
      Event.count({ where: { status: 'completed' } }),
      
      // Repair counts
      RepairRequest.count(),
      RepairRequest.count({ where: { status: { [Op.in]: ['accepted', 'in_progress'] } } }),
      RepairRequest.count({ where: { status: 'completed' } }),
      
      // Recycler counts
      WasteDeposit.count(),
      WasteDeposit.count({ where: { verificationStatus: 'verified' } }),
      WasteDeposit.sum('weight'),
      
      // Moderation counts
      Report.count(),
      Report.count({ where: { status: { [Op.in]: ['reported', 'under_review'] } } }),
      Report.count({ where: { status: 'resolved' } }),
      
      // Engagement counts
      Review.count(),
      EcoKarma.count(),
      Notification.count(),
      
      // Pending verification
      Provider.count({ where: { verificationStatus: 'pending' } }),
      Location.count({ where: { verificationStatus: 'pending' } }),
      
      // Recent activity (last 10 of each)
      User.findAll({ order: [['createdAt', 'DESC']], limit: 10, attributes: ['id', 'name', 'email', 'role', 'createdAt'] }),
      Post.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: User, as: 'author', attributes: ['name'] }] }),
      BusinessMaterial.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: User, as: 'user', attributes: ['name'] }] }),
      Challenge.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: User, as: 'creator', attributes: ['name'] }] }),
      Event.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: User, as: 'creator', attributes: ['name'] }] }),
      RepairRequest.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: User, as: 'user', attributes: ['name'] }] }),
      Report.findAll({ order: [['createdAt', 'DESC']], limit: 10, include: [{ model: User, as: 'reporter', attributes: ['name'] }] })
    ]);

    // Calculate growth metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersLastMonth,
      newPostsLastMonth,
      newDealsLastMonth,
      newEventsLastMonth
    ] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Post.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      BusinessMaterial.count({ where: { status: 'completed', updatedAt: { [Op.gte]: thirtyDaysAgo } } }),
      Event.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } })
    ]);

    // Get top contributors
    const topContributors = await User.findAll({
      order: [['ecoKarmaTotal', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'email', 'role', 'ecoKarmaTotal', 'avatar']
    });

    res.json({
      success: true,
      data: {
        // Summary statistics
        stats: {
          // Users
          totalUsers,
          adminUsers,
          moderatorUsers,
          recyclerUsers,
          repairProviderUsers,
          businessUsers,
          organizationUsers,
          regularUsers,
          
          // Content
          totalPosts,
          totalComments,
          totalDevices,
          totalListings,
          totalLocations,
          totalCommunities,
          
          // Business
          totalMaterials,
          totalMaterialRequests,
          activeMaterialListings,
          completedDeals,
          
          // Organization
          totalChallenges,
          activeChallenges,
          completedChallenges,
          totalEvents,
          upcomingEvents,
          completedEvents,
          
          // Repair
          totalRepairRequests,
          activeRepairs,
          completedRepairs,
          
          // Recycler
          totalWasteDeposits,
          verifiedDeposits,
          totalWasteKg: parseFloat(totalWasteKg || 0).toFixed(2),
          
          // Moderation
          totalReports,
          pendingReports,
          resolvedReports,
          
          // Engagement
          totalReviews,
          totalKarmaActivities,
          totalNotifications,
          
          // Pending
          pendingProviders,
          pendingLocations,
          
          // Growth
          newUsersLastMonth,
          newPostsLastMonth,
          newDealsLastMonth,
          newEventsLastMonth
        },
        
        // Recent activity
        recentActivity: {
          users: recentUsers,
          posts: recentPosts,
          materials: recentMaterials,
          challenges: recentChallenges,
          events: recentEvents,
          repairs: recentRepairs,
          reports: recentReports
        },
        
        // Top contributors
        topContributors
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all users with advanced filtering
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, verificationStatus, search, page = 1, limit = 50 } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows: users, count } = await User.findAndCountAll({
      where,
      include: [{ model: Provider, as: 'provider' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all business materials
export const getAllBusinessMaterials = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows: materials, count } = await BusinessMaterial.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: MaterialRequest, as: 'requests' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all challenges
export const getAllChallenges = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows: challenges, count } = await Challenge.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: ChallengeParticipant, as: 'participants', limit: 5 }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all events
export const getAllEvents = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows: events, count } = await Event.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: EventParticipant, as: 'participants', limit: 5 }
      ],
      order: [['startDate', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all repair requests
export const getAllRepairRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows: requests, count } = await RepairRequest.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Provider, as: 'provider', attributes: ['id', 'businessName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all waste deposits
export const getAllWasteDeposits = async (req, res, next) => {
  try {
    const { verificationStatus, page = 1, limit = 20 } = req.query;
    const where = {};
    if (verificationStatus) where.verificationStatus = verificationStatus;

    const { rows: deposits, count } = await WasteDeposit.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Provider, as: 'provider', attributes: ['id', 'businessName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        deposits,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all reports
export const getAllReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { rows: reports, count } = await Report.findAndCountAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get platform analytics
export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    // Get growth trends
    const [
      userGrowth,
      postGrowth,
      materialGrowth,
      eventGrowth
    ] = await Promise.all([
      User.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true
      }),
      Post.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true
      }),
      BusinessMaterial.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true
      }),
      Event.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE_TRUNC', 'day', sequelize.col('createdAt')), 'ASC']],
        raw: true
      })
    ]);

    res.json({
      success: true,
      data: {
        period,
        growth: {
          users: userGrowth,
          posts: postGrowth,
          materials: materialGrowth,
          events: eventGrowth
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
