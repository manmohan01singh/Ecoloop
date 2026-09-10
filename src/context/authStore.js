import { create } from 'zustand';
import api from '../services/api.js';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ecoloop_user') || 'null'),
  token: localStorage.getItem('ecoloop_token') || null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('ecoloop_token', data.data.tokens.accessToken);
      localStorage.setItem('ecoloop_user', JSON.stringify(data.data.user));
      set({ user: data.data.user, token: data.data.tokens.accessToken, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('ecoloop_token', data.data.tokens.accessToken);
      localStorage.setItem('ecoloop_user', JSON.stringify(data.data.user));
      set({ user: data.data.user, token: data.data.tokens.accessToken, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('ecoloop_token');
    localStorage.removeItem('ecoloop_user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('ecoloop_token'),
}));

export default useAuthStore;
