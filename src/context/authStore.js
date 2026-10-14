import { create } from 'zustand';
import api from '../services/api.js';

const getStoredToken = () => localStorage.getItem('circuvio_token') || localStorage.getItem('ecoloop_token') || null;
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('circuvio_user') || localStorage.getItem('ecoloop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistSession = (token, user) => {
  if (token) {
    localStorage.setItem('circuvio_token', token);
    localStorage.setItem('ecoloop_token', token);
  }
  if (user) {
    const json = JSON.stringify(user);
    localStorage.setItem('circuvio_user', json);
    localStorage.setItem('ecoloop_user', json);
  }
};

const clearSession = () => {
  localStorage.removeItem('circuvio_token');
  localStorage.removeItem('circuvio_user');
  localStorage.removeItem('ecoloop_token');
  localStorage.removeItem('ecoloop_user');
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persistSession(data.data.tokens.accessToken, data.data.user);
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
      persistSession(data.data.tokens.accessToken, data.data.user);
      set({ user: data.data.user, token: data.data.tokens.accessToken, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null });
  },

  updateUser: (updated) => {
    if (updated) {
      const json = JSON.stringify(updated);
      localStorage.setItem('circuvio_user', json);
      localStorage.setItem('ecoloop_user', json);
    }
    set({ user: updated });
  },

  isAuthenticated: () => !!getStoredToken(),
}));

export default useAuthStore;
