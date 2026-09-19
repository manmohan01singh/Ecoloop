import { Router } from 'express';
import authRoutes from './auth.routes.js';
import deviceRoutes from './device.routes.js';
import impactRoutes from './impact.routes.js';
import uploadRoutes from './upload.routes.js';
import communityRoutes from './community.routes.js';
import postRoutes from './post.routes.js';
import listingRoutes from './listing.routes.js';
import locationRoutes from './location.routes.js';
import providerRoutes from './provider.routes.js';
import challengeRoutes from './challenge.routes.js';
import eventRoutes from './event.routes.js';
import reportRoutes from './report.routes.js';
import businessRoutes from './business.routes.js';
import karmaRoutes from './karma.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/impact', impactRoutes);
router.use('/upload', uploadRoutes);
router.use('/communities', communityRoutes);
router.use('/posts', postRoutes);
router.use('/listings', listingRoutes);
router.use('/locations', locationRoutes);
router.use('/providers', providerRoutes);
router.use('/challenges', challengeRoutes);
router.use('/events', eventRoutes);
router.use('/reports', reportRoutes);
router.use('/business-exchange', businessRoutes);
router.use('/karma', karmaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'EcoLoop API is running', timestamp: new Date().toISOString(), version: '2.0.0' });
});

export default router;
