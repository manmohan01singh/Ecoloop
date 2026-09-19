import { Router } from 'express';
import { getLocations, getLocation, submitLocation, verifyLocation } from '../controllers/location.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.get('/', getLocations);
router.get('/:id', getLocation);
router.post('/', authenticate, submitLocation);
router.put('/:id/verify', authenticate, authorize('admin'), verifyLocation);
export default router;
