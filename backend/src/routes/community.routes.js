import { Router } from 'express';
import { getCommunities, getCommunity, createCommunity, joinCommunity, leaveCommunity, updateCommunity, getMembers } from '../controllers/community.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', getCommunities);
router.get('/:slug', authenticate, getCommunity);
router.post('/', authenticate, createCommunity);
router.put('/:id', authenticate, updateCommunity);
router.post('/:id/join', authenticate, joinCommunity);
router.delete('/:id/leave', authenticate, leaveCommunity);
router.get('/:id/members', getMembers);
export default router;
