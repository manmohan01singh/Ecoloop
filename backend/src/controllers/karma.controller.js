import { EcoKarma, User, Listing, RepairRequest, WasteDeposit, Event, Challenge } from '../models/index.js';
import { getBadges } from '../services/karma.service.js';
import sequelize from '../models/index.js';

export const getMyKarma = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const logs = await EcoKarma.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });

    const badges = getBadges(user.ecoKarmaTotal);

    // Impact stats
    const listingsCompleted = await Listing.count({ where: { userId: req.user.id, status: 'completed' } });
    const repairsDone = await RepairRequest.count({ where: { userId: req.user.id, status: 'completed' } });
    const totalKgDeposited = await WasteDeposit.sum('weightKg', { where: { userId: req.user.id } }) || 0;
    const eventsJoined = await Event.count({ include: [{ association: 'participants', where: { userId: req.user.id } }] });
    const challengesDone = await Challenge.count({ where: { status: 'completed' }, include: [{ association: 'participants', where: { userId: req.user.id } }] });

    res.json({
      success: true,
      data: {
        ecoKarmaTotal: user.ecoKarmaTotal,
        badges,
        logs,
        impact: {
          listingsCompleted,
          repairsDone,
          totalKgDeposited: parseFloat(totalKgDeposited.toFixed(2)),
          eventsJoined,
          challengesDone,
        },
        disclaimer: 'Impact metrics are estimates based on self-reported data and are not scientifically verified.',
      },
    });
  } catch (e) { next(e); }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const leaders = await User.findAll({
      attributes: ['id', 'name', 'avatar', 'city', 'ecoKarmaTotal'],
      order: [['ecoKarmaTotal', 'DESC']],
      limit: 20,
    });
    res.json({ success: true, data: leaders });
  } catch (e) { next(e); }
};

export const getPlatformImpact = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalListings = await Listing.count({ where: { status: 'completed' } });
    const totalRepairs = await RepairRequest.count({ where: { status: 'completed' } });
    const totalDeposits = await WasteDeposit.sum('weightKg') || 0;
    const totalEvents = await Event.count({ where: { status: 'completed' } });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalListingsCompleted: totalListings,
        totalRepairsCompleted: totalRepairs,
        totalWasteDepositedKg: parseFloat((totalDeposits || 0).toFixed(2)),
        totalEventsCompleted: totalEvents,
        disclaimer: 'All figures are estimated based on user-reported data and have not been independently verified.',
      },
    });
  } catch (e) { next(e); }
};
