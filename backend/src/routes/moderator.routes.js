import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
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
} from '../controllers/moderator.controller.js';

const router = express.Router();

// All routes require authentication and moderator/admin role
router.use(authenticate, authorize('moderator', 'admin'));

// Dashboard
router.get('/dashboard', getModeratorDashboard);

// Post Moderation
router.get('/posts', getAllPostsForModeration);
router.post('/posts/:id/moderate', moderatePost);
router.post('/posts/:id/pin', pinPost);

// Comment Moderation
router.get('/comments', getAllCommentsForModeration);
router.post('/comments/:id/moderate', moderateComment);

// Report Management
router.get('/reports', getReportsForModerator);
router.post('/reports/:id/handle', handleReport);

// User Management
router.get('/users/search', searchUsers);
router.get('/users/:userId/profile', getUserProfile);
router.post('/users/:userId/warn', issueWarning);
router.post('/users/:userId/suspend', suspendUser);

// Community Management
router.get('/communities', getCommunities);

// Audit/History
router.get('/history', getModerationHistory);

export default router;
