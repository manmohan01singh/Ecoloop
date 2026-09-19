import { Router } from 'express';
import { getDashboard, getUsers, updateUser, moderatePost, verifyProvider, verifyLocationAdmin, getPendingLocations, getPendingProviders, getPendingReports, getOrganizationStats, getUserContributions } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// Organization stats (accessible by organization role and admin)
router.get('/organization/stats/:userId?', getOrganizationStats);

// Admin-only routes
router.use(authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:userId/contributions', getUserContributions);
router.put('/users/:id', updateUser);
router.put('/posts/:id/moderate', moderatePost);
router.put('/providers/:id/verify', verifyProvider);
router.put('/locations/:id/verify', verifyLocationAdmin);
router.get('/locations/pending', getPendingLocations);
router.get('/providers/pending', getPendingProviders);
router.get('/reports/pending', getPendingReports);
export default router;
