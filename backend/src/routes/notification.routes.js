import { Router } from 'express';
import { getNotifications, markRead, markOneRead } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markRead);
router.put('/:id/read', authenticate, markOneRead);
export default router;
