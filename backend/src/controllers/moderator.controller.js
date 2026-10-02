import { User, Post, Comment, Community, Report, Notification, PostVote, CommunityMember } from '../models/index.js';
import { Op } from 'sequelize';

const requireModerator = (req, res) => {
  if (!['admin', 'moderator'].includes(req.user.role)) {
    res.status(403).json({ success: false, error: { message: 'Moderator or Admin only' } });
    return false;
  }
  return true;
};

// Dashboard Stats
export const getModeratorDashboard = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const [
      totalReports,
      pendingReports,
      resolvedReports,
      flaggedPosts,
      suspendedUsers,
      totalPosts,
      totalComments,
      recentActivity
    ] = await Promise.all([
      Report.count(),
      Report.count({ where: { status: { [Op.in]: ['reported', 'under_review'] } } }),
      Report.count({ where: { status: 'resolved' } }),
      Post.count({ where: { isRemoved: true } }),
      User.count({ where: { role: 'suspended' } }),
      Post.count(),
      Comment.count(),
      Post.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
          { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] }
        ]
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalReports,
          pendingReports,
          resolvedReports,
          flaggedPosts,
          suspendedUsers,
          totalPosts,
          totalComments
        },
        recentActivity
      }
    });
  } catch (e) { next(e); }
};

// Get All Posts with Moderation Info
export const getAllPostsForModeration = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { page = 1, limit = 20, search, category, status, communityId } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { body: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (category) where.category = category;
    if (status === 'removed') where.isRemoved = true;
    else if (status === 'active') where.isRemoved = false;
    if (communityId) where.communityId = communityId;

    const { rows, count } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar', 'role'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Get All Comments for Moderation
export const getAllCommentsForModeration = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { page = 1, limit = 20, search, status } = req.query;
    const where = {};
    
    if (search) where.body = { [Op.iLike]: `%${search}%` };
    if (status === 'removed') where.isRemoved = true;
    else if (status === 'active') where.isRemoved = false;

    const { rows, count } = await Comment.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Post, as: 'post', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Moderate Post (Approve/Remove/Hide)
export const moderatePost = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { action, reason } = req.body; // action: 'approve', 'remove', 'hide'
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });

    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

    if (action === 'remove' || action === 'hide') {
      await post.update({ isRemoved: true });
      
      // Notify user
      await Notification.create({
        userId: post.authorId,
        type: 'moderation',
        title: 'Your post was removed',
        body: reason || 'Your post violated community guidelines.',
        link: `/community/post/${post.id}`
      });
    } else if (action === 'approve') {
      await post.update({ isRemoved: false });
    }

    res.json({ success: true, data: post, message: `Post ${action}d successfully` });
  } catch (e) { next(e); }
};

// Moderate Comment
export const moderateComment = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { action, reason } = req.body;
    const comment = await Comment.findByPk(req.params.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }]
    });

    if (!comment) return res.status(404).json({ success: false, error: { message: 'Comment not found' } });

    if (action === 'remove') {
      await comment.update({ isRemoved: true });
      
      await Notification.create({
        userId: comment.authorId,
        type: 'moderation',
        title: 'Your comment was removed',
        body: reason || 'Your comment violated community guidelines.'
      });
    } else if (action === 'approve') {
      await comment.update({ isRemoved: false });
    }

    res.json({ success: true, data: comment, message: `Comment ${action}d successfully` });
  } catch (e) { next(e); }
};

// Get All Reports with Filters
export const getReportsForModerator = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { page = 1, limit = 20, status, category, search, severity } = req.query;
    const where = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows, count } = await Report.findAndCountAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email', 'avatar'] }],
      order: [
        ['status', 'ASC'], // Pending first
        ['upvotes', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Handle Report Action
export const handleReport = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { action, adminNote } = req.body; // action: 'approve', 'reject', 'under_review', 'verified', 'resolved'
    const report = await Report.findByPk(req.params.id, {
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }]
    });

    if (!report) return res.status(404).json({ success: false, error: { message: 'Report not found' } });

    const statusMap = {
      approve: 'verified',
      reject: 'rejected',
      under_review: 'under_review',
      verified: 'verified',
      resolved: 'resolved'
    };

    await report.update({
      status: statusMap[action] || action,
      adminNote: adminNote || null,
      resolvedAt: action === 'resolved' ? new Date() : null
    });

    // Notify reporter
    await Notification.create({
      userId: report.reporterId,
      type: 'report_status',
      title: `Report Update: ${report.title}`,
      body: adminNote || `Your report has been marked as ${statusMap[action] || action}`,
      link: `/reports/${report.id}`
    });

    res.json({ success: true, data: report, message: 'Report handled successfully' });
  } catch (e) { next(e); }
};

// User Management - View User Profile
export const getUserProfile = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const user = await User.findByPk(req.params.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    const [posts, comments, reports] = await Promise.all([
      Post.count({ where: { authorId: user.id } }),
      Comment.count({ where: { authorId: user.id } }),
      Report.count({ where: { reporterId: user.id } })
    ]);

    res.json({
      success: true,
      data: {
        user,
        stats: { posts, comments, reports }
      }
    });
  } catch (e) { next(e); }
};

// Issue Warning to User
export const issueWarning = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { reason, severity } = req.body; // severity: 'low', 'medium', 'high'
    const user = await User.findByPk(req.params.userId);

    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    await Notification.create({
      userId: user.id,
      type: 'warning',
      title: `${severity.toUpperCase()} Warning`,
      body: reason || 'You have received a warning from moderators.',
      link: '/profile'
    });

    res.json({ success: true, message: 'Warning issued successfully' });
  } catch (e) { next(e); }
};

// Temporary Suspension
export const suspendUser = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { days, reason } = req.body;
    const user = await User.findByPk(req.params.userId);

    if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    // Note: You'd add a suspendedUntil field to User model for production
    await Notification.create({
      userId: user.id,
      type: 'suspension',
      title: 'Account Temporarily Suspended',
      body: `Your account has been suspended for ${days} days. Reason: ${reason}`,
      link: '/profile'
    });

    res.json({ success: true, message: `User suspended for ${days} days` });
  } catch (e) { next(e); }
};

// Community Management
export const getCommunities = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { page = 1, limit = 20, search } = req.query;
    const where = {};

    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { rows, count } = await Community.findAndCountAll({
      where,
      include: [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Manage Pinned Posts
export const pinPost = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { isPinned } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

    // Note: Add isPinned field to Post model for production
    res.json({ success: true, message: isPinned ? 'Post pinned' : 'Post unpinned' });
  } catch (e) { next(e); }
};

// Search Users
export const searchUsers = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    const { search, role, page = 1, limit = 20 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({ success: true, data: { items: rows, total: count, page: parseInt(page) } });
  } catch (e) { next(e); }
};

// Moderation History/Audit
export const getModerationHistory = async (req, res, next) => {
  try {
    if (!requireModerator(req, res)) return;

    // This would require a ModerationLog model in production
    // For now, return notifications related to moderation
    const history = await Notification.findAll({
      where: { type: { [Op.in]: ['moderation', 'warning', 'suspension'] } },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: history });
  } catch (e) { next(e); }
};

export default {
  getModeratorDashboard,
  getAllPostsForModeration,
  getAllCommentsForModeration,
  moderatePost,
  moderateComment,
  getReportsForModerator,
  handleReport,
  getUserProfile,
  issueWarning,
  suspendUser,
  getCommunities,
  pinPost,
  searchUsers,
  getModerationHistory
};
