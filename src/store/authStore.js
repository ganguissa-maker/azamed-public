// src/store/authStore.js — Persistance session web (localStorage)
import { create } from 'zustand';

const TOKEN_KEY = '@azamed_token';
const USER_KEY  = '@azamed_user';

const useAuthStore = create((set, get) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,

  hydrate: () => {
    try {
      const token   = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      }
    } catch {}
  },

  login: (user, token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (updatedUser) => {
    try { localStorage.setItem(USER_KEY, JSON.stringify(updatedUser)); } catch {}
    set({ user: updatedUser });
  },

  logout: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
