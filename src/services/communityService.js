import api from './api.js';

export const getCommunities = (params) => api.get('/communities', { params });
export const getCommunity = (slug) => api.get(`/communities/${slug}`);
export const createCommunity = (data) => api.post('/communities', data);
export const updateCommunity = (id, data) => api.put(`/communities/${id}`, data);
export const joinCommunity = (id) => api.post(`/communities/${id}/join`);
export const leaveCommunity = (id) => api.delete(`/communities/${id}/leave`);
export const getCommunityMembers = (id, params) => api.get(`/communities/${id}/members`, { params });

export const getPosts = (params) => api.get('/posts', { params });
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => api.post('/posts', data);
export const votePost = (id, value) => api.post(`/posts/${id}/vote`, { value });
export const addComment = (id, data) => api.post(`/posts/${id}/comments`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getListings = (params) => api.get('/listings', { params });
export const getListing = (id) => api.get(`/listings/${id}`);
export const createListing = (data) => api.post('/listings', data);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data);
export const deleteListing = (id) => api.delete(`/listings/${id}`);
export const requestListing = (id, message) => api.post(`/listings/${id}/request`, { message });
export const updateRequestStatus = (requestId, status) => api.put(`/listings/requests/${requestId}`, { status });
export const getMyListings = () => api.get('/listings/mine');

export const getLocations = (params) => api.get('/locations', { params });
export const submitLocation = (data) => api.post('/locations', data);

export const getProviders = (params) => api.get('/providers', { params });
export const getProvider = (id) => api.get(`/providers/${id}`);
export const createProvider = (data) => api.post('/providers', data);
export const getRepairRequests = (params) => api.get('/providers/repair/requests', { params });
export const createRepairRequest = (data) => api.post('/providers/repair/requests', data);
export const updateRepairStatus = (id, data) => api.put(`/providers/repair/requests/${id}/status`, data);
export const recordDeposit = (data) => api.post('/providers/deposits', data);
export const getMyDeposits = () => api.get('/providers/deposits/mine');

export const getChallenges = (params) => api.get('/challenges', { params });
export const getChallenge = (id) => api.get(`/challenges/${id}`);
export const joinChallenge = (id) => api.post(`/challenges/${id}/join`);
export const logContribution = (id, data) => api.post(`/challenges/${id}/contribute`, data);

export const getEvents = (params) => api.get('/events', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (data) => api.post('/events', data);
export const joinEvent = (id) => api.post(`/events/${id}/join`);
export const leaveEvent = (id) => api.delete(`/events/${id}/leave`);

export const getReports = (params) => api.get('/reports', { params });
export const createReport = (data) => api.post('/reports', data);
export const upvoteReport = (id) => api.post(`/reports/${id}/upvote`);

export const getMaterials = (params) => api.get('/business-exchange', { params });
export const getMaterial = (id) => api.get(`/business-exchange/${id}`);
export const createMaterial = (data) => api.post('/business-exchange', data);
export const requestMaterial = (id, data) => api.post(`/business-exchange/${id}/request`, data);
export const getMyMaterials = () => api.get('/business-exchange/mine');

export const getMyKarma = () => api.get('/karma/me');
export const getLeaderboard = () => api.get('/karma/leaderboard');
export const getPlatformImpact = () => api.get('/karma/platform');

export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.put('/notifications/read-all');

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const getUserContributions = (userId) => api.get(`/admin/users/${userId}/contributions`);
export const getOrganizationStats = (userId) => api.get(`/admin/organization/stats/${userId || ''}`);
export const getPendingLocations = () => api.get('/admin/locations/pending');
export const verifyLocationAdmin = (id, status) => api.put(`/admin/locations/${id}/verify`, { status });
export const getPendingProviders = () => api.get('/admin/providers/pending');
export const verifyProvider = (id, status) => api.put(`/admin/providers/${id}/verify`, { status });
export const getPendingReports = () => api.get('/admin/reports/pending');
export const updateReportStatus = (id, data) => api.put(`/reports/${id}/status`, data);
