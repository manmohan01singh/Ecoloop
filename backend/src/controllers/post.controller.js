import { Post, PostVote, Comment, User, Community, CommunityMember, Notification, Bookmark } from '../models/index.js';
import { Op, literal } from 'sequelize';
import { awardKarma } from '../services/karma.service.js';

const hotScore = (upvotes, downvotes, createdAt) => {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = (new Date(createdAt) - new Date('2025-01-01')) / 1000;
  return parseFloat((sign * order + seconds / 45000).toFixed(7));
};

export const getPosts = async (req, res, next) => {
  try {
    const { sort = 'hot', category, communityId, communitySlug, page = 1, limit = 20, search } = req.query;
    const where = { isRemoved: false };
    if (category) where.category = category;
    if (communityId) where.communityId = communityId;
    if (communitySlug) {
      const c = await Community.findOne({ where: { slug: communitySlug } });
      if (c) where.communityId = c.id;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { body: { [Op.like]: `%${search}%` } },
      ];
    }

    const orderMap = {
      hot: [['score', 'DESC']],
      new: [['createdAt', 'DESC']],
      top: [['upvotes', 'DESC']],
      discussed: [['commentCount', 'DESC']],
    };

    const { rows, count } = await Post.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'ecoKarmaTotal', 'role'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
      ],
      order: orderMap[sort] || orderMap.hot,
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    // Attach user vote & bookmark if logged in
    let userVotes = {};
    let userBookmarks = new Set();
    if (req.user) {
      const postIds = rows.map(p => p.id);
      const [votes, bookmarks] = await Promise.all([
        PostVote.findAll({ where: { postId: postIds, userId: req.user.id } }),
        Bookmark.findAll({ where: { postId: postIds, userId: req.user.id } }),
      ]);
      votes.forEach(v => { userVotes[v.postId] = v.value; });
      bookmarks.forEach(b => { userBookmarks.add(b.postId); });
    }

    const items = rows.map(p => ({
      ...p.toJSON(),
      userVote: userVotes[p.id] || 0,
      isBookmarked: userBookmarks.has(p.id),
    }));
    res.json({ success: true, data: { items, total: count, page: parseInt(page, 10), pages: Math.ceil(count / limit) } });
  } catch (e) { next(e); }
};

export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'ecoKarmaTotal', 'role'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
        {
          model: Comment, as: 'comments',
          where: { parentId: null, isRemoved: false },
          required: false,
          include: [
            { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
            {
              model: Comment, as: 'replies', required: false, where: { isRemoved: false },
              include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });
    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

    let userVote = 0;
    let isBookmarked = false;
    if (req.user) {
      const [v, b] = await Promise.all([
        PostVote.findOne({ where: { postId: post.id, userId: req.user.id } }),
        Bookmark.findOne({ where: { postId: post.id, userId: req.user.id } }),
      ]);
      userVote = v?.value || 0;
      isBookmarked = !!b;
    }
    res.json({ success: true, data: { ...post.toJSON(), userVote, isBookmarked } });
  } catch (e) { next(e); }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, body, category, communityId, images, flair } = req.body;

    if (!title || title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title must be at least 3 characters long' },
      });
    }

    if (title.trim().length > 300) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title must not exceed 300 characters' },
      });
    }

    if (communityId) {
      const member = await CommunityMember.findOne({ where: { communityId, userId: req.user.id } });
      if (!member) return res.status(403).json({ success: false, error: { message: 'Join community to post' } });
    }

    const post = await Post.create({
      authorId: req.user.id,
      title: title.trim(),
      body: body ? body.trim() : null,
      category: category || 'general',
      communityId: communityId || null,
      images: images || [],
      flair: flair || null,
    });
    if (communityId) await Community.increment('postCount', { where: { id: communityId } });

    const fullPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role', 'ecoKarmaTotal'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
      ],
    });

    res.status(201).json({ success: true, data: fullPost || post, message: 'Post created' });
  } catch (e) { next(e); }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    }

    const existing = await Bookmark.findOne({
      where: { userId: req.user.id, postId },
    });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, isBookmarked: false, data: { isBookmarked: false }, message: 'Bookmark removed' });
    } else {
      await Bookmark.create({ userId: req.user.id, postId });
      return res.json({ success: true, isBookmarked: true, data: { isBookmarked: true }, message: 'Post bookmarked' });
    }
  } catch (e) { next(e); }
};

export const getMyBookmarks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      attributes: ['postId', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    const postIds = bookmarks.map(b => b.postId);
    const posts = await Post.findAll({
      where: { id: postIds, isRemoved: false },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
      ],
    });

    const items = posts.map(p => ({ ...p.toJSON(), isBookmarked: true }));
    res.json({ success: true, data: { items, total: bookmarks.length } });
  } catch (e) { next(e); }
};

export const votePost = async (req, res, next) => {
  try {
    const { value } = req.body; // 1 or -1
    if (![1, -1, 0].includes(value)) return res.status(400).json({ success: false, error: { message: 'Invalid vote' } });

    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });

    const existing = await PostVote.findOne({ where: { postId: post.id, userId: req.user.id } });

    if (value === 0) {
      if (existing) {
        if (existing.value === 1) await post.decrement('upvotes');
        else await post.decrement('downvotes');
        await existing.destroy();
      }
    } else if (existing) {
      if (existing.value !== value) {
        if (value === 1) { await post.increment('upvotes'); await post.decrement('downvotes'); }
        else { await post.decrement('upvotes'); await post.increment('downvotes'); }
        await existing.update({ value });
      }
    } else {
      if (value === 1) await post.increment('upvotes');
      else await post.increment('downvotes');
      await PostVote.create({ postId: post.id, userId: req.user.id, value });
    }

    await post.reload();
    const newScore = hotScore(post.upvotes, post.downvotes, post.createdAt);
    await post.update({ score: newScore });

    res.json({ success: true, data: { upvotes: post.upvotes, downvotes: post.downvotes, userVote: value } });
  } catch (e) { next(e); }
};

export const addComment = async (req, res, next) => {
  try {
    const { body, parentId } = req.body;
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: { message: 'Post not found' } });
    if (post.isLocked) return res.status(403).json({ success: false, error: { message: 'Post is locked' } });

    const comment = await Comment.create({ postId: post.id, authorId: req.user.id, body, parentId: parentId || null });
    await post.increment('commentCount');

    // Notify post author
    if (post.authorId !== req.user.id) {
      await Notification.create({
        userId: post.authorId, type: parentId ? 'reply' : 'comment',
        title: parentId ? `${req.user.name} replied to a comment` : `${req.user.name} commented on your post`,
        body: body.slice(0, 100), link: `/community/post/${post.id}`,
      });
    }

    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] }],
    });
    res.status(201).json({ success: true, data: full });
  } catch (e) { next(e); }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: { message: 'Not found' } });
    if (post.authorId !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
    await post.destroy();
    res.json({ success: true, message: 'Post deleted' });
  } catch (e) { next(e); }
};
