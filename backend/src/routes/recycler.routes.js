import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getRecyclerDashboard,
  getRecyclingRequests,
  handleRecyclingRequest,
  getPickups,
  updatePickupStatus,
  getCollectedWaste,
  recordCollection,
  getCollectionDrives,
  getOrganizations,
  getRecyclerImpact,
  updateRecyclerProfile
} from '../controllers/recycler.controller.js';

const router = express.Router();

// All routes require authentication and recycler/admin role
router.use(authenticate, authorize('recycler', 'admin'));

// Dashboard
router.get('/dashboard', getRecyclerDashboard);

// Recycling Requests
router.get('/requests', getRecyclingRequests);
router.post('/requests/:id/handle', handleRecyclingRequest);

// Pickups
router.get('/pickups', getPickups);
router.post('/pickups/:id/status', updatePickupStatus);

// Collected Waste
router.get('/collections', getCollectedWaste);
router.post('/collections', recordCollection);

// Drives
router.get('/drives', getCollectionDrives);

// Organizations
router.get('/organizations', getOrganizations);

// Impact
router.get('/impact', getRecyclerImpact);

// Profile
router.put('/profile', updateRecyclerProfile);

export default router;
