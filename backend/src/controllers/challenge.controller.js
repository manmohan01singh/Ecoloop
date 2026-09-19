import { Challenge, ChallengeParticipant, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

export const getChallenges = async (req, res, next) => {
  try {
    const { status, createdBy, page = 1, limit = 20 } = req.query;
    const where = { isPublic: true };
    if (status) where.status = status;
    if (createdBy) where.createdById = createdBy;

    const { rows, count } = await Challenge.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] }],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    let joined = {};
    if (req.user) {
      const parts = await ChallengeParticipant.findAll({ where: { challengeId: rows.map(c => c.id), userId: req.user.id } });
      parts.forEach(p => { joined[p.challengeId] = true; });
    }

    const items = rows.map(c => ({ ...c.toJSON(), isJoined: !!joined[c.id] }));
    res.json({ success: true, data: { items, total: count } });
  } catch (e) { next(e); }
};

export const getChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
        {
          model: ChallengeParticipant, as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'city'] }],
          order: [['contribution', 'DESC']],
          limit: 20,
        },
      ],
    });
    if (!challenge) return res.status(404).json({ success: false, error: { message: 'Not found' } });

    let isJoined = false;
    if (req.user) {
      const p = await ChallengeParticipant.findOne({ where: { challengeId: challenge.id, userId: req.user.id } });
      isJoined = !!p;
    }

    // Build leaderboard
    const leaderboard = await ChallengeParticipant.findAll({
      where: { challengeId: challenge.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'city'] }],
      order: [['contribution', 'DESC']],
      limit: 10,
    });

    res.json({ success: true, data: { ...challenge.toJSON(), isJoined, leaderboard } });
  } catch (e) { next(e); }
};

export const createChallenge = async (req, res, next) => {
  try {
    const { title, description, category, goalType, goalValue, startDate, endDate, ecoKarmaReward } = req.body;
    if (!['admin', 'organization', 'business', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { message: 'Only organizations can create challenges' } });
    }
    const challenge = await Challenge.create({
      createdById: req.user.id, title, description, category,
      goalType, goalValue, startDate, endDate,
      ecoKarmaReward: ecoKarmaReward || 25,
      status: new Date(startDate) <= new Date() ? 'active' : 'upcoming',
    });
    res.status(201).json({ success: true, data: challenge });
  } catch (e) { next(e); }
};

export const joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findByPk(req.params.id);
    if (!challenge || challenge.status === 'completed' || challenge.status === 'cancelled') {
      return res.status(400).json({ success: false, error: { message: 'Challenge not active' } });
    }
    const existing = await ChallengeParticipant.findOne({ where: { challengeId: challenge.id, userId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Already joined' } });

    await ChallengeParticipant.create({ challengeId: challenge.id, userId: req.user.id });
    await challenge.increment('participantCount');
    res.json({ success: true, message: 'Joined challenge' });
  } catch (e) { next(e); }
};

export const logContribution = async (req, res, next) => {
  try {
    const { amount, unit } = req.body;
    const participant = await ChallengeParticipant.findOne({ where: { challengeId: req.params.id, userId: req.user.id } });
    if (!participant) return res.status(400).json({ success: false, error: { message: 'Join challenge first' } });

    await participant.increment('contribution', { by: parseFloat(amount) });
    const challenge = await Challenge.findByPk(req.params.id);
    await challenge.increment('currentValue', { by: parseFloat(amount) });

    await challenge.reload();
    if (parseFloat(challenge.currentValue) >= parseFloat(challenge.goalValue) && challenge.status === 'active') {
      await challenge.update({ status: 'completed' });
      // Award karma to all participants
      const all = await ChallengeParticipant.findAll({ where: { challengeId: challenge.id } });
      for (const p of all) {
        await awardKarma(p.userId, 'challenge_completed', `Completed challenge: ${challenge.title}`);
      }
    }

    res.json({ success: true, data: { challenge, contribution: participant.contribution } });
  } catch (e) { next(e); }
};
