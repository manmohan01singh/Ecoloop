import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getOrganizationDashboard,
  getOrganizationAnalytics,
  getMyChallenges,
  getMyEvents,
  updateEventResults,
  getChallengeParticipants,
  getEventParticipants,
  getImpactSummary,
} from '../controllers/organization.controller.js';

const router = Router();

// All routes require organization or admin role
router.use(authenticate, authorize('organization', 'admin'));

// Dashboard
router.get('/dashboard', getOrganizationDashboard);
router.get('/analytics', getOrganizationAnalytics);
router.get('/impact-summary', getImpactSummary);

// Challenges
router.get('/challenges', getMyChallenges);
router.get('/challenges/:challengeId/participants', getChallengeParticipants);

// Events
router.get('/events', getMyEvents);
router.get('/events/:eventId/participants', getEventParticipants);
router.put('/events/:eventId/results', updateEventResults);

export default router;
