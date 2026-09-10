import { Router } from 'express';
import authRoutes from './auth.routes.js';
import deviceRoutes from './device.routes.js';
import impactRoutes from './impact.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/impact', impactRoutes);
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'EcoLoop API is running', timestamp: new Date().toISOString() });
});

export default router;
