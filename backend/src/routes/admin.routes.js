import { Router } from 'express';
import { getDashboard, getUsers, updateUser, moderatePost, verifyProvider, verifyLocationAdmin, getPendingLocations, getPendingProviders, getPendingReports, getOrganizationStats, getUserContributions } from '../controllers/admin.controller.js';
import * as comprehensiveAdminController from '../controllers/admin.comprehensive.controller.js';
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

// NEW: Comprehensive admin routes - ALL DASHBOARDS DATA
router.get('/comprehensive-dashboard', comprehensiveAdminController.getComprehensiveAdminDashboard);
router.get('/all-users', comprehensiveAdminController.getAllUsers);
router.get('/all-materials', comprehensiveAdminController.getAllBusinessMaterials);
router.get('/all-challenges', comprehensiveAdminController.getAllChallenges);
router.get('/all-events', comprehensiveAdminController.getAllEvents);
router.get('/all-repairs', comprehensiveAdminController.getAllRepairRequests);
router.get('/all-deposits', comprehensiveAdminController.getAllWasteDeposits);
router.get('/all-reports', comprehensiveAdminController.getAllReports);
router.get('/platform-analytics', comprehensiveAdminController.getPlatformAnalytics);

export default router;
