import { Router } from 'express';
import { getReports, createReport, upvoteReport, updateReportStatus } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();
router.get('/', optionalAuth, getReports);
router.post('/', authenticate, createReport);
router.post('/:id/upvote', authenticate, upvoteReport);
router.put('/:id/status', authenticate, updateReportStatus);
export default router;
