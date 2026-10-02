import api from './api';

// Dashboard
export const getDashboard = () => api.get('/repair-provider/dashboard');

// Repair Requests
export const getRepairRequests = (params) => api.get('/repair-provider/requests', { params });
export const getRepairRequestDetails = (id) => api.get(`/repair-provider/requests/${id}`);
export const acceptRepairRequest = (id) => api.post(`/repair-provider/requests/${id}/accept`);
export const rejectRepairRequest = (id, data) => api.post(`/repair-provider/requests/${id}/reject`, data);
export const updateRepairStatus = (id, data) => api.patch(`/repair-provider/requests/${id}/status`, data);
export const addDiagnosis = (id, data) => api.post(`/repair-provider/requests/${id}/diagnosis`, data);

// E-Waste
export const recordEWaste = (data) => api.post('/repair-provider/ewaste', data);

// Services
export const getServices = () => api.get('/repair-provider/services');
export const updateServices = (data) => api.put('/repair-provider/services', data);

// Customers
export const getCustomers = () => api.get('/repair-provider/customers');
export const getCustomerHistory = (userId) => api.get(`/repair-provider/customers/${userId}/history`);

// Profile
export const updateProfile = (data) => api.put('/repair-provider/profile', data);

// Reviews
export const getReviews = () => api.get('/repair-provider/reviews');
