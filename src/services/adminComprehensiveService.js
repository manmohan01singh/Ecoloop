import api from './api';

// Comprehensive dashboard - ALL DATA
export const getComprehensiveDashboard = () => api.get('/admin/comprehensive-dashboard');

// Get all data from each dashboard type
export const getAllUsers = (params) => api.get('/admin/all-users', { params });
export const getAllMaterials = (params) => api.get('/admin/all-materials', { params });
export const getAllChallenges = (params) => api.get('/admin/all-challenges', { params });
export const getAllEvents = (params) => api.get('/admin/all-events', { params });
export const getAllRepairs = (params) => api.get('/admin/all-repairs', { params });
export const getAllDeposits = (params) => api.get('/admin/all-deposits', { params });
export const getAllReports = (params) => api.get('/admin/all-reports', { params });
export const getPlatformAnalytics = (params) => api.get('/admin/platform-analytics', { params });
