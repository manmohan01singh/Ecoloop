import { Router } from 'express';
import { getListings, getListing, createListing, updateListing, deleteListing, requestListing, updateRequestStatus, getMyListings } from '../controllers/listing.controller.js';
import { authenticate } from '../middleware/auth.js';

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return authenticate(req, res, next);
  next();
};

const router = Router();
router.get('/', optionalAuth, getListings);
router.get('/mine', authenticate, getMyListings);
router.get('/:id', optionalAuth, getListing);
router.post('/', authenticate, createListing);
router.put('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);
router.post('/:id/request', authenticate, requestListing);
router.put('/requests/:requestId', authenticate, updateRequestStatus);
export default router;
