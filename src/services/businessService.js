import api from './api';

// Dashboard
export const getBusinessDashboard = () => api.get('/business-exchange/dashboard');
export const getBusinessAnalytics = (params) => api.get('/business-exchange/analytics', { params });

// Materials
export const getMaterials = (params) => api.get('/business-exchange', { params });
export const getMaterial = (id) => api.get(`/business-exchange/${id}`);
export const getMyMaterials = () => api.get('/business-exchange/mine');
export const createMaterial = (data) => api.post('/business-exchange', data);
export const updateMaterial = (id, data) => api.put(`/business-exchange/${id}`, data);
export const deleteMaterial = (id) => api.delete(`/business-exchange/${id}`);

// Requests
export const requestMaterial = (id, data) => api.post(`/business-exchange/${id}/request`, data);
export const updateRequestStatus = (requestId, data) => api.put(`/business-exchange/requests/${requestId}/status`, data);
export const getMyRequests = () => api.get('/business-exchange/my-requests');
