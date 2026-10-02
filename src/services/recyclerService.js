import api from './api';

// Dashboard
export const getRecyclerDashboard = () => api.get('/recycler/dashboard');

// Recycling Requests
export const getRecyclingRequests = (params) => api.get('/recycler/requests', { params });
export const handleRecyclingRequest = (id, data) => api.post(`/recycler/requests/${id}/handle`, data);

// Pickups
export const getPickups = (params) => api.get('/recycler/pickups', { params });
export const updatePickupStatus = (id, data) => api.post(`/recycler/pickups/${id}/status`, data);

// Collections
export const getCollectedWaste = (params) => api.get('/recycler/collections', { params });
export const recordCollection = (data) => api.post('/recycler/collections', data);

// Drives
export const getCollectionDrives = () => api.get('/recycler/drives');

// Organizations
export const getOrganizations = () => api.get('/recycler/organizations');

// Impact
export const getRecyclerImpact = () => api.get('/recycler/impact');

// Profile
export const updateRecyclerProfile = (data) => api.put('/recycler/profile', data);
