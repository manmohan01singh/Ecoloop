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
import reviewRoutes from './review.routes.js';
import moderatorRoutes from './moderator.routes.js';
import recyclerRoutes from './recycler.routes.js';
import repairProviderRoutes from './repairProvider.routes.js';
import organizationRoutes from './organization.routes.js';
import userRoutes from './user.routes.js';
import applicationRoutes from './application.routes.js';

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
router.use('/reviews', reviewRoutes);
router.use('/moderator', moderatorRoutes);
router.use('/recycler', recyclerRoutes);
router.use('/repair-provider', repairProviderRoutes);
router.use('/organization', organizationRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Circuvio API is running', timestamp: new Date().toISOString(), version: '2.0.0' });
});

export default router;
