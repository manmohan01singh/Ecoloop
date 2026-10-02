import api from './api';

// Dashboard
export const getModeratorDashboard = () => api.get('/moderator/dashboard');

// Post Moderation
export const getAllPostsForModeration = (params) => api.get('/moderator/posts', { params });
export const moderatePost = (id, data) => api.post(`/moderator/posts/${id}/moderate`, data);
export const pinPost = (id, data) => api.post(`/moderator/posts/${id}/pin`, data);

// Comment Moderation
export const getAllCommentsForModeration = (params) => api.get('/moderator/comments', { params });
export const moderateComment = (id, data) => api.post(`/moderator/comments/${id}/moderate`, data);

// Report Management
export const getReportsForModerator = (params) => api.get('/moderator/reports', { params });
export const handleReport = (id, data) => api.post(`/moderator/reports/${id}/handle`, data);

// User Management
export const searchUsers = (params) => api.get('/moderator/users/search', { params });
export const getUserProfileForMod = (userId) => api.get(`/moderator/users/${userId}/profile`);
export const issueWarning = (userId, data) => api.post(`/moderator/users/${userId}/warn`, data);
export const suspendUser = (userId, data) => api.post(`/moderator/users/${userId}/suspend`, data);

// Community Management
export const getCommunitiesForMod = (params) => api.get('/moderator/communities', { params });

// Audit/History
export const getModerationHistory = () => api.get('/moderator/history');
