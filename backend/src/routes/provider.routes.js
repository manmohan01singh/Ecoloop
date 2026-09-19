import { Router } from 'express';
import {
  getProviders, getProvider, createProvider, updateProvider,
  getRepairRequests, createRepairRequest, updateRepairStatus,
  recordDeposit, getMyDeposits,
} from '../controllers/provider.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', getProviders);
router.get('/:id', getProvider);
router.post('/', authenticate, createProvider);
router.put('/me', authenticate, updateProvider);

// Repair
router.get('/repair/requests', authenticate, getRepairRequests);
router.post('/repair/requests', authenticate, createRepairRequest);
router.put('/repair/requests/:id/status', authenticate, updateRepairStatus);

// Waste Bank Deposits
router.post('/deposits', authenticate, recordDeposit);
router.get('/deposits/mine', authenticate, getMyDeposits);
export default router;
