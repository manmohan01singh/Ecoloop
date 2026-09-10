import { Router } from 'express';
import { getUserImpact, getGlobalImpact } from '../controllers/impact.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/global', getGlobalImpact);
router.get('/user/:userId', authenticate, getUserImpact);
router.get('/me', authenticate, getUserImpact);

export default router;
