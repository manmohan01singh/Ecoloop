import { Router } from 'express';
import { getMaterials, getMaterial, createMaterial, requestMaterial, updateMaterialRequestStatus, getMyMaterials } from '../controllers/business.controller.js';
import { authenticate } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();
router.get('/', optionalAuth, getMaterials);
router.get('/mine', authenticate, getMyMaterials);
router.get('/:id', optionalAuth, getMaterial);
router.post('/', authenticate, createMaterial);
router.post('/:id/request', authenticate, requestMaterial);
router.put('/requests/:requestId/status', authenticate, updateMaterialRequestStatus);
export default router;
