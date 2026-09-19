import { Router } from 'express';
import { getMyKarma, getLeaderboard, getPlatformImpact } from '../controllers/karma.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/me', authenticate, getMyKarma);
router.get('/leaderboard', getLeaderboard);
router.get('/platform', getPlatformImpact);
export default router;
