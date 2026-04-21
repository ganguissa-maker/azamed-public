// src/utils/api.js — SITE PUBLIC
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Injecter token si utilisateur connecté
  const token = localStorage.getItem('azamed_user_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API]', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
