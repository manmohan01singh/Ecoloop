import { Event, EventParticipant, User, Community, Notification } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

export const getEvents = async (req, res, next) => {
  try {
    const { type, city, status, createdBy, page = 1, limit = 20 } = req.query;
    const where = {};
    if (type) where.type = type;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (status) where.status = status;
    else where.status = { [Op.in]: ['upcoming', 'ongoing'] };
    if (createdBy) where.createdById = createdBy;

    const { rows, count } = await Event.findAndCountAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    let joined = {};
    if (req.user) {
      const parts = await EventParticipant.findAll({ where: { eventId: rows.map(e => e.id), userId: req.user.id } });
      parts.forEach(p => { joined[p.eventId] = true; });
    }

    const items = rows.map(e => ({ ...e.toJSON(), isJoined: !!joined[e.id] }));
    res.json({ success: true, data: { items, total: count } });
  } catch (e) { next(e); }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
        { model: EventParticipant, as: 'participants', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }] },
      ],
    });
    if (!event) return res.status(404).json({ success: false, error: { message: 'Not found' } });

    let isJoined = false;
    if (req.user) {
      const p = await EventParticipant.findOne({ where: { eventId: event.id, userId: req.user.id } });
      isJoined = !!p;
    }
    res.json({ success: true, data: { ...event.toJSON(), isJoined } });
  } catch (e) { next(e); }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, type, address, city, lat, lng, startDate, endDate, capacity, goalDescription, communityId } = req.body;
    const event = await Event.create({
      createdById: req.user.id, title, description, type, address, city, lat, lng,
      startDate, endDate, capacity, goalDescription, communityId: communityId || null,
    });
    res.status(201).json({ success: true, data: event });
  } catch (e) { next(e); }
};

export const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event || event.status === 'cancelled') return res.status(400).json({ success: false, error: { message: 'Event not available' } });
    if (event.capacity && event.participantCount >= event.capacity) {
      return res.status(400).json({ success: false, error: { message: 'Event is full' } });
    }
    const existing = await EventParticipant.findOne({ where: { eventId: event.id, userId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Already joined' } });

    await EventParticipant.create({ eventId: event.id, userId: req.user.id });
    await event.increment('participantCount');
    res.json({ success: true, message: 'Joined event' });
  } catch (e) { next(e); }
};

export const leaveEvent = async (req, res, next) => {
  try {
    const p = await EventParticipant.findOne({ where: { eventId: req.params.id, userId: req.user.id } });
    if (!p) return res.status(404).json({ success: false, error: { message: 'Not joined' } });
    await p.destroy();
    await Event.decrement('participantCount', { where: { id: req.params.id } });
    res.json({ success: true, message: 'Left event' });
  } catch (e) { next(e); }
};

export const submitResults = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    if (event.createdById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    const { resultParticipants, resultMaterialKg, resultItemsRepaired, resultItemsReused } = req.body;
    await event.update({ resultParticipants, resultMaterialKg, resultItemsRepaired, resultItemsReused, status: 'completed' });

    // Award karma to all attendees
    const parts = await EventParticipant.findAll({ where: { eventId: event.id, ecoKarmaAwarded: false } });
    for (const p of parts) {
      await awardKarma(p.userId, 'event_completed', `Attended event: ${event.title}`);
      await p.update({ status: 'attended', ecoKarmaAwarded: true });
    }

    res.json({ success: true, data: event, message: 'Results submitted' });
  } catch (e) { next(e); }
};
