import { Listing, ListingRequest, User, Notification } from '../models/index.js';
import { Op } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

export const getListings = async (req, res, next) => {
  try {
    const { category, circularAction, city, isFree, status = 'available', search, page = 1, limit = 20 } = req.query;
    const where = { status, deletedAt: null };
    if (category) where.category = category;
    if (circularAction) where.circularAction = circularAction;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (isFree !== undefined) where.isFree = isFree === 'true';
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await Listing.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'city'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'city', 'phone'] },
        { model: ListingRequest, as: 'requests', include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'avatar'] }] },
      ],
    });
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Listing not found' } });
    await listing.increment('viewCount');
    res.json({ success: true, data: listing });
  } catch (e) { next(e); }
};

export const createListing = async (req, res, next) => {
  try {
    const { title, description, category, material, condition, quantity, unit, city, province,
      pickupType, price, isFree, availableUntil, circularAction, contactMethod, images } = req.body;
    const listing = await Listing.create({
      userId: req.user.id, title, description, category, material, condition, quantity, unit,
      city, province, pickupType, price: isFree ? 0 : price, isFree,
      availableUntil, circularAction, contactMethod, images: images || [],
    });
    res.status(201).json({ success: true, data: listing, message: 'Listing created' });
  } catch (e) { next(e); }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await listing.update(req.body);
    res.json({ success: true, data: listing });
  } catch (e) { next(e); }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!listing) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    await listing.destroy();
    res.json({ success: true, message: 'Listing deleted' });
  } catch (e) { next(e); }
};

export const requestListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing || listing.status !== 'available') {
      return res.status(400).json({ success: false, error: { message: 'Listing not available' } });
    }
    if (listing.userId === req.user.id) {
      return res.status(400).json({ success: false, error: { message: 'Cannot request your own listing' } });
    }
    const existing = await ListingRequest.findOne({ where: { listingId: listing.id, requesterId: req.user.id } });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Already requested' } });

    const request = await ListingRequest.create({ listingId: listing.id, requesterId: req.user.id, message: req.body.message });

    await Notification.create({
      userId: listing.userId, type: 'listing_request',
      title: `New request for "${listing.title}"`,
      body: req.body.message || 'Someone is interested in your listing',
      link: `/marketplace/${listing.id}`,
    });

    res.status(201).json({ success: true, data: request, message: 'Request sent' });
  } catch (e) { next(e); }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await ListingRequest.findByPk(req.params.requestId, {
      include: [{ model: Listing, as: 'listing' }],
    });
    if (!request) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    if (request.listing.userId !== req.user.id) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

    await request.update({ status, completedAt: status === 'completed' ? new Date() : null });

    if (status === 'completed') {
      await request.listing.update({ status: 'completed' });
      await awardKarma(request.listing.userId, 'listing_completed', `Listing "${request.listing.title}" completed`);
      await awardKarma(request.requesterId, 'item_reuse', `Received item via "${request.listing.title}"`);
      await Notification.create({
        userId: request.requesterId, type: 'request_accepted',
        title: 'Transaction completed!',
        body: `Your request for "${request.listing.title}" has been marked complete.`,
        link: `/marketplace/${request.listing.id}`,
      });
    } else if (status === 'accepted') {
      await request.listing.update({ status: 'reserved' });
      await Notification.create({
        userId: request.requesterId, type: 'request_accepted',
        title: 'Your request was accepted',
        body: `The owner accepted your request for "${request.listing.title}".`,
        link: `/marketplace/${request.listing.id}`,
      });
    }

    res.json({ success: true, data: request });
  } catch (e) { next(e); }
};

export const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      where: { userId: req.user.id },
      include: [{ model: ListingRequest, as: 'requests', include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'avatar'] }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: listings });
  } catch (e) { next(e); }
};
