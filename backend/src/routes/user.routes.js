import { Router } from 'express';
import {
  getPublicProfile,
  getUserPublicPosts,
  getUserPublicReplies,
  toggleFollowUser,
} from '../controllers/user.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// Public profile retrieval (optional authentication to check follow status and ownership)
router.get('/profile/:identifier', optionalAuthenticate, getPublicProfile);
router.get('/profile/:identifier/posts', optionalAuthenticate, getUserPublicPosts);
router.get('/profile/:identifier/replies', optionalAuthenticate, getUserPublicReplies);

// Social actions (requires authentication)
router.post('/:id/follow', authenticate, toggleFollowUser);

export default router;
