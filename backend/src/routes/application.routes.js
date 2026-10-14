import { Router } from 'express';
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  updateMyApplication,
  getAdminApplicationsQueue,
  startApplicationReview,
  approveApplication,
  rejectApplication,
  requestMoreInformation,
} from '../controllers/application.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Reviewer queue endpoints (admin and moderator) - must precede /:id
router.get('/queue/all', authenticate, authorize('admin', 'moderator'), getAdminApplicationsQueue);
router.get('/queue', authenticate, authorize('admin', 'moderator'), getAdminApplicationsQueue);

// User application endpoints
router.post('/', authenticate, submitApplication);
router.get('/mine', authenticate, getMyApplications);
router.get('/:id', authenticate, getApplicationById);
router.put('/:id', authenticate, updateMyApplication);

router.post('/:id/review', authenticate, authorize('admin', 'moderator'), startApplicationReview);
router.post('/:id/approve', authenticate, authorize('admin', 'moderator'), approveApplication);
router.post('/:id/reject', authenticate, authorize('admin', 'moderator'), rejectApplication);
router.post('/:id/request-info', authenticate, authorize('admin', 'moderator'), requestMoreInformation);

export default router;
