import { Router } from 'express';
import {
  getProviders, getProvider, createProvider, updateProvider,
  getRepairRequests, getRepairRequest, createRepairRequest, updateRepairStatus,
  submitRepairQuote, getRepairQuotes, acceptRepairQuote,
  getRepairMessages, sendRepairMessage,
  recordDeposit, getMyDeposits,
} from '../controllers/provider.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', getProviders);
router.get('/:id', getProvider);
router.post('/', authenticate, createProvider);
router.put('/me', authenticate, updateProvider);

// Repair Requests & Quotes
router.get('/repair/requests', authenticate, getRepairRequests);
router.get('/repair/requests/:id', authenticate, getRepairRequest);
router.post('/repair/requests', authenticate, createRepairRequest);
router.put('/repair/requests/:id/status', authenticate, updateRepairStatus);

// Quotes
router.post('/repair/requests/:id/quotes', authenticate, submitRepairQuote);
router.get('/repair/requests/:id/quotes', authenticate, getRepairQuotes);
router.post('/repair/requests/:id/quotes/:quoteId/accept', authenticate, acceptRepairQuote);

// In-Request Messaging
router.get('/repair/requests/:id/messages', authenticate, getRepairMessages);
router.post('/repair/requests/:id/messages', authenticate, sendRepairMessage);

// Waste Bank Deposits
router.post('/deposits', authenticate, recordDeposit);
router.get('/deposits/mine', authenticate, getMyDeposits);
export default router;
