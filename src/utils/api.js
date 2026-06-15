// src/utils/api.js — Axios avec token auto depuis localStorage
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://azamed-backend-production.up.railway.app/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token automatiquement
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('@azamed_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (import.meta.env.DEV) {
      console.warn('API Error:', err.config?.url, err.response?.status, err.response?.data);
    }
    return Promise.reject(err);
  }
);

export default api;
