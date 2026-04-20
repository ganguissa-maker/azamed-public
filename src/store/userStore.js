// src/store/userStore.js
import { create } from 'zustand';

const useUserStore = create((set) => ({
  user:            JSON.parse(localStorage.getItem('azamed_user_public') || 'null'),
  token:           localStorage.getItem('azamed_user_token') || null,
  isAuthenticated: !!localStorage.getItem('azamed_user_token'),

  login: (user, token) => {
    localStorage.setItem('azamed_user_token', token);
    localStorage.setItem('azamed_user_public', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('azamed_user_token');
    localStorage.removeItem('azamed_user_public');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (user) => {
    localStorage.setItem('azamed_user_public', JSON.stringify(user));
    set({ user });
  },
}));

export default useUserStore;
