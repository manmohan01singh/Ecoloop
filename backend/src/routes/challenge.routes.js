import { Router } from 'express';
import { getChallenges, getChallenge, createChallenge, joinChallenge, logContribution } from '../controllers/challenge.controller.js';
import { authenticate } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();
router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallenge);
router.post('/', authenticate, createChallenge);
router.post('/:id/join', authenticate, joinChallenge);
router.post('/:id/contribute', authenticate, logContribution);
export default router;
