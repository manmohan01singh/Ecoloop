import api from './api';

// Dashboard
export const getOrganizationDashboard = () => api.get('/organization/dashboard');
export const getOrganizationAnalytics = (params) => api.get('/organization/analytics', { params });
export const getImpactSummary = () => api.get('/organization/impact-summary');

// Challenges
export const getMyChallenges = (params) => api.get('/organization/challenges', { params });
export const getChallengeParticipants = (challengeId) => api.get(`/organization/challenges/${challengeId}/participants`);

// Events
export const getMyEvents = (params) => api.get('/organization/events', { params });
export const getEventParticipants = (eventId) => api.get(`/organization/events/${eventId}/participants`);
export const updateEventResults = (eventId, data) => api.put(`/organization/events/${eventId}/results`, data);
