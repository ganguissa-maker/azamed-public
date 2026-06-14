// src/utils/api.js — Site public
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://azamed-backend-production.up.railway.app/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
