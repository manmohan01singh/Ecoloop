import { Router } from 'express';
import {
  createDevice, getDevices, getDevice, updateDevice, deleteDevice,
  getDeathClock, getDashboard, getAIRecommendations,
} from '../controllers/device.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate); // All device routes require auth

router.get('/dashboard', getDashboard);
router.post('/', createDevice);
router.get('/', getDevices);
router.get('/:id', getDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.get('/:id/death-clock', getDeathClock);
router.get('/:id/ai-recommendations', getAIRecommendations);

export default router;
