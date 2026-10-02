import { Router } from 'express';
import {
  getMaterials, getMaterial, createMaterial, requestMaterial,
  updateMaterialRequestStatus, getMyMaterials, getBusinessDashboard,
  getBusinessAnalytics, getMyRequests, updateMaterial, deleteMaterial
} from '../controllers/business.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();

// Dashboard routes (requires business or admin role)
router.get('/dashboard', authenticate, authorize('business', 'admin'), getBusinessDashboard);
router.get('/analytics', authenticate, authorize('business', 'admin'), getBusinessAnalytics);
router.get('/my-requests', authenticate, authorize('business', 'admin'), getMyRequests);

// Material CRUD
router.get('/', optionalAuth, getMaterials);
router.get('/mine', authenticate, getMyMaterials);
router.get('/:id', optionalAuth, getMaterial);
router.post('/', authenticate, createMaterial);
router.put('/:id', authenticate, updateMaterial);
router.delete('/:id', authenticate, deleteMaterial);

// Material requests
router.post('/:id/request', authenticate, requestMaterial);
router.put('/requests/:requestId/status', authenticate, updateMaterialRequestStatus);

export default router;
