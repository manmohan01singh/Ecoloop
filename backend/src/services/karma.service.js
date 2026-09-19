import { Op } from 'sequelize';
import { EcoKarma, User } from '../models/index.js';

const DAILY_LIMIT = 200;

const KARMA_VALUES = {
  community_contribution: 5,
  item_reuse: 15,
  repair_completed: 20,
  recycling_deposit: 20,
  event_completed: 25,
  material_exchange: 30,
  challenge_completed: 25,
  listing_completed: 15,
  report_verified: 10,
  other: 5,
};

export async function awardKarma(userId, reason, description = '', referenceId = null, referenceType = null) {
  try {
    const points = KARMA_VALUES[reason] || 5;

    // Daily limit check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await EcoKarma.findAll({ where: { userId, createdAt: { [Op.gte]: today } } });
    const todayTotal = todayLogs.reduce((s, l) => s + l.points, 0);
    if (todayTotal >= DAILY_LIMIT) return null;

    const log = await EcoKarma.create({ userId, points, reason, description, referenceId, referenceType });
    await User.increment('ecoKarmaTotal', { by: points, where: { id: userId } });
    return log;
  } catch (e) {
    console.error('Karma award failed:', e.message);
    return null;
  }
}

export function getBadges(karma) {
  const badges = [];
  if (karma >= 10) badges.push({ id: 'first_step', name: 'First Step', icon: '🌱', description: 'Earned first EcoKarma' });
  if (karma >= 50) badges.push({ id: 'recycler', name: 'Recycler', icon: '♻️', description: 'Started recycling journey' });
  if (karma >= 100) badges.push({ id: 'repair_helper', name: 'Repair Helper', icon: '🔧', description: 'Helped repair community' });
  if (karma >= 200) badges.push({ id: 'community_builder', name: 'Community Builder', icon: '🏘️', description: 'Built community connections' });
  if (karma >= 350) badges.push({ id: 'reuse_champion', name: 'Reuse Champion', icon: '🔄', description: 'Champion of reuse' });
  if (karma >= 500) badges.push({ id: 'waste_warrior', name: 'Waste Warrior', icon: '⚔️', description: 'Warrior against waste' });
  if (karma >= 1000) badges.push({ id: 'circular_leader', name: 'Circular Leader', icon: '👑', description: 'Leader of circular economy' });
  return badges;
}
