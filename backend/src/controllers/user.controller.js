import { Op } from 'sequelize';
import {
  User, Post, Comment, Provider, Follow, BusinessMaterial,
  Challenge, Event, Community, Notification
} from '../models/index.js';

// Get public profile of a user by username or ID
export const getPublicProfile = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, error: { message: 'Identifier required' } });
    }

    // Try finding by username first, fallback to UUID if valid UUID format
    let user = await User.findOne({
      where: { username: identifier.toLowerCase().trim() },
      attributes: {
        exclude: ['password', 'email', 'phone', 'address', 'pincode'],
      },
    });

    if (!user) {
      // Check if identifier is UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      if (isUUID) {
        user = await User.findByPk(identifier, {
          attributes: {
            exclude: ['password', 'email', 'phone', 'address', 'pincode'],
          },
        });
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User profile not found' },
      });
    }

    const isOwnProfile = req.user ? req.user.id === user.id : false;

    // Parallel fetch real stats
    const [
      postsCount,
      commentsCount,
      followersCount,
      followingCount,
      providerData,
      isFollowing,
      businessMaterialsCount,
      challengesCount,
      eventsCount,
    ] = await Promise.all([
      Post.count({ where: { authorId: user.id, isRemoved: false } }),
      Comment.count({ where: { authorId: user.id, isRemoved: false } }),
      Follow.count({ where: { followingId: user.id } }),
      Follow.count({ where: { followerId: user.id } }),
      ['repair_provider', 'recycler'].includes(user.role)
        ? Provider.findOne({
            where: { userId: user.id, isActive: true },
            attributes: ['id', 'businessName', 'type', 'specializations', 'acceptedMaterials', 'ratingSum', 'ratingCount', 'completedJobs', 'serviceRadius', 'city', 'website', 'description', 'verificationStatus'],
          })
        : null,
      req.user && !isOwnProfile
        ? Follow.findOne({ where: { followerId: req.user.id, followingId: user.id } })
        : null,
      user.role === 'business'
        ? BusinessMaterial.count({ where: { userId: user.id, status: 'listed' } })
        : 0,
      user.role === 'organization'
        ? Challenge.count({ where: { createdById: user.id } })
        : 0,
      user.role === 'organization'
        ? Event.count({ where: { createdById: user.id } })
        : 0,
    ]);

    // Service details for verified roles
    let serviceDetails = null;
    if (providerData) {
      serviceDetails = {
        providerId: providerData.id,
        businessName: providerData.businessName,
        type: providerData.type,
        specializations: providerData.specializations || [],
        acceptedMaterials: providerData.acceptedMaterials || [],
        ratingAverage: providerData.ratingCount > 0
          ? Number((providerData.ratingSum / providerData.ratingCount).toFixed(1))
          : 5.0,
        completedJobs: providerData.completedJobs || 0,
        serviceRadius: providerData.serviceRadius,
        city: providerData.city,
        website: providerData.website,
        description: providerData.description,
        isVerified: providerData.verificationStatus === 'admin_verified',
      };
    } else if (user.role === 'business') {
      serviceDetails = {
        activeMaterialsCount: businessMaterialsCount,
        role: 'Verified Circular Business Partner',
      };
    } else if (user.role === 'organization') {
      serviceDetails = {
        challengesHosted: challengesCount,
        eventsHosted: eventsCount,
        role: 'Community Organization / Waste Bank Partner',
      };
    }

    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      coverImage: user.coverImage,
      bio: user.bio,
      city: user.city,
      state: user.state,
      role: user.role,
      ecoKarmaTotal: user.ecoKarmaTotal || 0,
      verificationStatus: user.verificationStatus,
      subscriptionTier: user.subscriptionTier,
      isPrivate: user.isPrivate,
      createdAt: user.createdAt,
      stats: {
        postsCount,
        commentsCount,
        followersCount,
        followingCount,
        repairsCompleted: providerData ? providerData.completedJobs : 0,
      },
      serviceDetails,
      isFollowing: !!isFollowing,
      isOwnProfile,
    };

    res.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    next(error);
  }
};

// Get public posts by user
export const getUserPublicPosts = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let user = await User.findOne({ where: { username: identifier.toLowerCase().trim() } });
    if (!user) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      if (isUUID) {
        user = await User.findByPk(identifier);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    // If private profile and not own profile
    if (user.isPrivate && (!req.user || req.user.id !== user.id)) {
      return res.json({
        success: true,
        data: { items: [], total: 0, isPrivate: true },
      });
    }

    const { rows: posts, count } = await Post.findAndCountAll({
      where: {
        authorId: user.id,
        isRemoved: false,
      },
      include: [
        { model: Community, as: 'community', attributes: ['id', 'name', 'slug'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'username', 'avatar', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    res.json({
      success: true,
      data: {
        items: posts,
        total: count,
        page: parseInt(page, 10),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get public replies/comments by user
export const getUserPublicReplies = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let user = await User.findOne({ where: { username: identifier.toLowerCase().trim() } });
    if (!user) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      if (isUUID) {
        user = await User.findByPk(identifier);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    if (user.isPrivate && (!req.user || req.user.id !== user.id)) {
      return res.json({
        success: true,
        data: { items: [], total: 0, isPrivate: true },
      });
    }

    const { rows: comments, count } = await Comment.findAndCountAll({
      where: {
        authorId: user.id,
        isRemoved: false,
      },
      include: [
        {
          model: Post,
          as: 'post',
          attributes: ['id', 'title'],
          include: [{ model: Community, as: 'community', attributes: ['id', 'name', 'slug'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    });

    res.json({
      success: true,
      data: {
        items: comments,
        total: count,
        page: parseInt(page, 10),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Follow or unfollow a user
export const toggleFollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        error: { code: 'SELF_FOLLOW', message: 'You cannot follow yourself' },
      });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User to follow was not found' },
      });
    }

    const existingFollow = await Follow.findOne({
      where: {
        followerId: req.user.id,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      await existingFollow.destroy();
      await Promise.all([
        targetUser.decrement('followerCount'),
        req.user.decrement('followingCount'),
      ]);

      const followersCount = await Follow.count({ where: { followingId: targetUserId } });
      return res.json({
        success: true,
        isFollowing: false,
        followerCount: followersCount,
        data: { isFollowing: false, followersCount },
        message: `Unfollowed @${targetUser.username}`,
      });
    } else {
      await Follow.create({
        followerId: req.user.id,
        followingId: targetUserId,
      });

      await Promise.all([
        targetUser.increment('followerCount'),
        req.user.increment('followingCount'),
      ]);

      await Notification.create({
        userId: targetUserId,
        type: 'new_follower',
        title: 'New Follower',
        body: `${req.user.name} (@${req.user.username || 'user'}) started following you`,
        link: `/u/${req.user.username || req.user.id}`,
      });

      const followersCount = await Follow.count({ where: { followingId: targetUserId } });
      return res.json({
        success: true,
        isFollowing: true,
        followerCount: followersCount,
        data: { isFollowing: true, followersCount },
        message: `Now following @${targetUser.username}`,
      });
    }
  } catch (error) {
    next(error);
  }
};
