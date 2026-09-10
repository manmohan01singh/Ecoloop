import api from './api.js';

export const getDashboard = () => api.get('/devices/dashboard');
export const getDevices = (params) => api.get('/devices', { params });
export const getDevice = (id) => api.get(`/devices/${id}`);
export const createDevice = (data) => api.post('/devices', data);
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`);
export const getDeathClock = (id, ai = false) => api.get(`/devices/${id}/death-clock`, { params: { ai } });
export const getAIRecommendations = (id) => api.get(`/devices/${id}/ai-recommendations`);

export const getMyImpact = () => api.get('/impact/me');
export const getGlobalImpact = () => api.get('/impact/global');

export const uploadDeviceImage = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/upload/device/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
