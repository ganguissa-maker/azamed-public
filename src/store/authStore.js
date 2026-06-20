// src/store/authStore.js — Avec refreshUser() pour synchroniser isVerified
import { create } from 'zustand';
import api from '../utils/api';

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

  // ✅ Rafraîchit isVerified et le reste depuis le serveur
  // (le médecin voit immédiatement le badge "Vérifié" sans se reconnecter)
  refreshUser: async () => {
    const { isAuthenticated, user } = get();
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/users/me');
      const merged = { ...user, ...data.user, profil: { ...user?.profil, ...data.user.profil } };
      try { localStorage.setItem(USER_KEY, JSON.stringify(merged)); } catch {}
      set({ user: merged });
    } catch {
      // Silencieux : si le token a expiré ou requête échoue, on garde l'état local
    }
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
