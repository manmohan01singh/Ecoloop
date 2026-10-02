import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as repairProviderController from '../controllers/repairProvider.controller.js';

const router = Router();

// All routes require repair_provider or admin role
router.use(authenticate, authorize('repair_provider', 'admin'));

// Dashboard
router.get('/dashboard', repairProviderController.getDashboard);

// Repair Requests
router.get('/requests', repairProviderController.getRepairRequests);
router.get('/requests/:id', repairProviderController.getRepairRequestDetails);
router.post('/requests/:id/accept', repairProviderController.acceptRepairRequest);
router.post('/requests/:id/reject', repairProviderController.rejectRepairRequest);
router.patch('/requests/:id/status', repairProviderController.updateRepairStatus);
router.post('/requests/:id/diagnosis', repairProviderController.addDiagnosis);

// E-Waste Management
router.post('/ewaste', repairProviderController.recordEWaste);

// Services
router.get('/services', repairProviderController.getServices);
router.put('/services', repairProviderController.updateServices);

// Customers
router.get('/customers', repairProviderController.getCustomers);
router.get('/customers/:userId/history', repairProviderController.getCustomerHistory);

// Profile
router.put('/profile', repairProviderController.updateProfile);

// Reviews
router.get('/reviews', repairProviderController.getReviews);

export default router;
