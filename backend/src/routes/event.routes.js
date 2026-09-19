import { Router } from 'express';
import { getEvents, getEvent, createEvent, joinEvent, leaveEvent, submitResults } from '../controllers/event.controller.js';
import { authenticate } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();
router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEvent);
router.post('/', authenticate, createEvent);
router.post('/:id/join', authenticate, joinEvent);
router.delete('/:id/leave', authenticate, leaveEvent);
router.post('/:id/results', authenticate, submitResults);
export default router;
