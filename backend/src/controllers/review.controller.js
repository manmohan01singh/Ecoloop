import { Review, User } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// POST /reviews  — create or update your own review
export const createReview = async (req, res, next) => {
  try {
    const { revieweeId, revieweeType, rating, title, body, referenceId, referenceType } = req.body;

    if (!revieweeId || !revieweeType || !rating) {
      return res.status(400).json({ success: false, error: { message: 'revieweeId, revieweeType and rating are required' } });
    }
    if (revieweeId === req.user.id) {
      return res.status(400).json({ success: false, error: { message: 'You cannot review yourself' } });
    }
    if (![1,2,3,4,5].includes(Number(rating))) {
      return res.status(400).json({ success: false, error: { message: 'Rating must be 1–5' } });
    }

    const reviewee = await User.findByPk(revieweeId);
    if (!reviewee) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    // Upsert — one review per reviewer/reviewee/type combination
    const [review, created] = await Review.findOrCreate({
      where: { reviewerId: req.user.id, revieweeId, revieweeType },
      defaults: { rating: Number(rating), title, body, referenceId, referenceType },
    });

    if (!created) {
      await review.update({ rating: Number(rating), title, body, referenceId, referenceType });
    }

    const full = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'reviewer', attributes: ['id','name','avatar','role'] }],
    });

    res.status(created ? 201 : 200).json({
      success: true,
      data: full,
      message: created ? 'Review submitted' : 'Review updated',
    });
  } catch (err) {
    // Unique constraint race condition → update instead
    if (err.name === 'SequelizeUniqueConstraintError') {
      try {
        const existing = await Review.findOne({
          where: { reviewerId: req.user.id, revieweeId: req.body.revieweeId, revieweeType: req.body.revieweeType },
        });
        if (existing) {
          await existing.update({ rating: Number(req.body.rating), title: req.body.title, body: req.body.body });
          return res.json({ success: true, data: existing, message: 'Review updated' });
        }
      } catch {}
    }
    next(err);
  }
};

// GET /reviews/:revieweeId  — all reviews for a user
export const getReviewsForUser = async (req, res, next) => {
  try {
    const { revieweeId } = req.params;
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { revieweeId };
    if (type) where.revieweeType = type;

    const { rows: reviews, count: total } = await Review.findAndCountAll({
      where,
      include: [{ model: User, as: 'reviewer', attributes: ['id','name','avatar','role'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    // Aggregate stats
    const stats = await Review.findAll({
      where: { revieweeId, ...(type ? { revieweeType: type } : {}) },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')),   'totalReviews'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating=5 THEN 1 ELSE 0 END")), 'five'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating=4 THEN 1 ELSE 0 END")), 'four'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating=3 THEN 1 ELSE 0 END")), 'three'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating=2 THEN 1 ELSE 0 END")), 'two'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating=1 THEN 1 ELSE 0 END")), 'one'],
      ],
      raw: true,
    });

    const s = stats[0] || {};

    res.json({
      success: true,
      data: {
        reviews,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
        stats: {
          avgRating:    s.avgRating ? parseFloat(parseFloat(s.avgRating).toFixed(1)) : 0,
          totalReviews: parseInt(s.totalReviews) || 0,
          distribution: { 5: parseInt(s.five)||0, 4: parseInt(s.four)||0, 3: parseInt(s.three)||0, 2: parseInt(s.two)||0, 1: parseInt(s.one)||0 },
        },
      },
    });
  } catch (err) { next(err); }
};

// GET /reviews/mine  — reviews I wrote
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { reviewerId: req.user.id },
      include: [{ model: User, as: 'reviewee', attributes: ['id','name','avatar','role'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};

// GET /reviews/received  — reviews I received
export const getMyReceivedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { revieweeId: req.user.id },
      include: [{ model: User, as: 'reviewer', attributes: ['id','name','avatar','role'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
};

// DELETE /reviews/:id  — delete your own review
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ where: { id: req.params.id, reviewerId: req.user.id } });
    if (!review) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
    await review.destroy();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// GET /reviews/reviewable  — users with reviewable roles (recyclers, repair providers, orgs)
export const getReviewableUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      role: role ? role : { [Op.in]: ['recycler', 'repair_provider', 'organization'] },
    };
    if (search) {
      where[Op.or] = [
        { name:  { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { city:  { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: ['id','name','avatar','role','city','bio','ecoKarmaTotal','verificationStatus'],
      order: [['ecoKarmaTotal', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    // Attach avg rating to each user
    const userIds = users.map(u => u.id);
    const ratings = await Review.findAll({
      where: { revieweeId: { [Op.in]: userIds } },
      attributes: [
        'revieweeId',
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')),   'totalReviews'],
      ],
      group: ['revieweeId'],
      raw: true,
    });

    const ratingMap = {};
    ratings.forEach(r => {
      ratingMap[r.revieweeId] = {
        avgRating: parseFloat(parseFloat(r.avgRating).toFixed(1)),
        totalReviews: parseInt(r.totalReviews),
      };
    });

    const enriched = users.map(u => ({
      ...u.toJSON(),
      avgRating:    ratingMap[u.id]?.avgRating    || 0,
      totalReviews: ratingMap[u.id]?.totalReviews || 0,
    }));

    res.json({
      success: true,
      data: {
        users: enriched,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) { next(err); }
};
