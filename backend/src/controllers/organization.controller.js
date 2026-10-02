import { Challenge, ChallengeParticipant, Event, EventParticipant, User, Community } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../models/index.js';

// ===== ORGANIZATION DASHBOARD =====
export const getOrganizationDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all challenges and events created by this organization
    const [challenges, events] = await Promise.all([
      Challenge.findAll({
        where: { createdById: userId },
        attributes: ['status', 'participantCount'],
      }),
      Event.findAll({
        where: { createdById: userId },
        attributes: ['status', 'participantCount', 'resultParticipants', 'resultMaterialKg'],
      }),
    ]);

    // Calculate stats
    const stats = {
      challengesCreated: challenges.length,
      activeChallenges: challenges.filter(c => c.status === 'active').length,
      completedChallenges: challenges.filter(c => c.status === 'completed').length,
      eventsHosted: events.length,
      upcomingEvents: events.filter(e => e.status === 'upcoming').length,
      ongoingEvents: events.filter(e => e.status === 'ongoing').length,
      completedEvents: events.filter(e => e.status === 'completed').length,
      totalParticipants: challenges.reduce((sum, c) => sum + c.participantCount, 0) +
                         events.reduce((sum, e) => sum + e.participantCount, 0),
      totalMaterialCollected: events.reduce((sum, e) => sum + (parseFloat(e.resultMaterialKg) || 0), 0),
    };

    // Get recent challenges
    const recentChallenges = await Challenge.findAll({
      where: { createdById: userId },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: ChallengeParticipant,
          as: 'participants',
          limit: 3,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
        },
      ],
    });

    // Get recent events
    const recentEvents = await Event.findAll({
      where: { createdById: userId },
      order: [['startDate', 'DESC']],
      limit: 5,
      include: [
        {
          model: EventParticipant,
          as: 'participants',
          limit: 3,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
        },
      ],
    });

    // Get upcoming events
    const upcomingEvents = await Event.findAll({
      where: {
        createdById: userId,
        status: 'upcoming',
        startDate: { [Op.gte]: new Date() },
      },
      order: [['startDate', 'ASC']],
      limit: 3,
    });

    res.json({
      success: true,
      data: {
        stats,
        challenges: recentChallenges,
        events: recentEvents,
        upcomingEvents,
      },
    });
  } catch (e) {
    next(e);
  }
};

// Get organization analytics
export const getOrganizationAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(startDate.getFullYear() - 1);

    // Participation growth over time
    const participationGrowth = await Event.findAll({
      where: {
        createdById: userId,
        createdAt: { [Op.gte]: startDate },
        status: { [Op.in]: ['completed', 'ongoing'] },
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startDate')), 'month'],
        [sequelize.fn('SUM', sequelize.col('participantCount')), 'participants'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'events'],
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startDate'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('startDate')), 'ASC']],
      raw: true,
    });

    // Challenge completion rates
    const challengeStats = await Challenge.findAll({
      where: {
        createdById: userId,
        createdAt: { [Op.gte]: startDate },
      },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.literal('(current_value / goal_value) * 100')), 'avgProgress'],
      ],
      group: ['status'],
      raw: true,
    });

    // Event types breakdown
    const eventsByType = await Event.findAll({
      where: {
        createdById: userId,
        createdAt: { [Op.gte]: startDate },
      },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('participantCount')), 'totalParticipants'],
      ],
      group: ['type'],
      raw: true,
    });

    // Impact metrics
    const impactMetrics = await Event.findAll({
      where: {
        createdById: userId,
        status: 'completed',
        resultsVerified: true,
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('resultMaterialKg')), 'totalMaterial'],
        [sequelize.fn('SUM', sequelize.col('resultItemsRepaired')), 'totalRepaired'],
        [sequelize.fn('SUM', sequelize.col('resultItemsReused')), 'totalReused'],
        [sequelize.fn('SUM', sequelize.col('resultParticipants')), 'totalParticipants'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        participationGrowth,
        challengeStats,
        eventsByType,
        impactMetrics: impactMetrics[0] || {},
        period,
      },
    });
  } catch (e) {
    next(e);
  }
};

// Get all challenges by organization
export const getMyChallenges = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { createdById: req.user.id };
    if (status) where.status = status;

    const challenges = await Challenge.findAll({
      where,
      include: [
        {
          model: ChallengeParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: challenges });
  } catch (e) {
    next(e);
  }
};

// Get all events by organization
export const getMyEvents = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { createdById: req.user.id };
    if (status) where.status = status;

    const events = await Event.findAll({
      where,
      include: [
        {
          model: EventParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      order: [['startDate', 'DESC']],
    });

    res.json({ success: true, data: events });
  } catch (e) {
    next(e);
  }
};

// Update event results (post-event reporting)
export const updateEventResults = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.eventId, createdById: req.user.id },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { message: 'Event not found or unauthorized' },
      });
    }

    const { resultParticipants, resultMaterialKg, resultItemsRepaired, resultItemsReused, resultsVerified } = req.body;

    await event.update({
      resultParticipants,
      resultMaterialKg,
      resultItemsRepaired,
      resultItemsReused,
      resultsVerified: resultsVerified !== undefined ? resultsVerified : false,
    });

    res.json({
      success: true,
      data: event,
      message: 'Event results updated successfully',
    });
  } catch (e) {
    next(e);
  }
};

// Get participants for a challenge
export const getChallengeParticipants = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({
      where: { id: req.params.challengeId, createdById: req.user.id },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: { message: 'Challenge not found or unauthorized' },
      });
    }

    const participants = await ChallengeParticipant.findAll({
      where: { challengeId: req.params.challengeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar', 'city', 'ecoKarmaTotal'],
        },
      ],
      order: [['progressValue', 'DESC']],
    });

    res.json({ success: true, data: participants });
  } catch (e) {
    next(e);
  }
};

// Get participants for an event
export const getEventParticipants = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.eventId, createdById: req.user.id },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { message: 'Event not found or unauthorized' },
      });
    }

    const participants = await EventParticipant.findAll({
      where: { eventId: req.params.eventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'avatar', 'city', 'ecoKarmaTotal'],
        },
      ],
      order: [['joinedAt', 'ASC']],
    });

    res.json({ success: true, data: participants });
  } catch (e) {
    next(e);
  }
};

// Get organization impact summary
export const getImpactSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all completed events with verified results
    const completedEvents = await Event.findAll({
      where: {
        createdById: userId,
        status: 'completed',
        resultsVerified: true,
      },
      attributes: [
        'id',
        'title',
        'type',
        'startDate',
        'resultParticipants',
        'resultMaterialKg',
        'resultItemsRepaired',
        'resultItemsReused',
      ],
      order: [['startDate', 'DESC']],
    });

    // Get completed challenges
    const completedChallenges = await Challenge.findAll({
      where: {
        createdById: userId,
        status: 'completed',
      },
      attributes: ['id', 'title', 'goalType', 'goalValue', 'currentValue', 'participantCount', 'endDate'],
      order: [['endDate', 'DESC']],
    });

    // Calculate total impact
    const totalImpact = {
      eventsCompleted: completedEvents.length,
      challengesCompleted: completedChallenges.length,
      totalParticipants: completedEvents.reduce((sum, e) => sum + (e.resultParticipants || 0), 0) +
                         completedChallenges.reduce((sum, c) => sum + (c.participantCount || 0), 0),
      totalMaterialKg: completedEvents.reduce((sum, e) => sum + (parseFloat(e.resultMaterialKg) || 0), 0),
      totalItemsRepaired: completedEvents.reduce((sum, e) => sum + (e.resultItemsRepaired || 0), 0),
      totalItemsReused: completedEvents.reduce((sum, e) => sum + (e.resultItemsReused || 0), 0),
    };

    res.json({
      success: true,
      data: {
        totalImpact,
        completedEvents,
        completedChallenges,
      },
    });
  } catch (e) {
    next(e);
  }
};
