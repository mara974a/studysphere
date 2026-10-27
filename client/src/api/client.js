import axios from 'axios';

// Configurable API URL for local Vite dev and Vercel/Render production
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: automatically inject JWT if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studysphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiry/invalidation cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials from storage
      localStorage.removeItem('studysphere_token');
      localStorage.removeItem('studysphere_user');
      
      // Dispatch custom event so AuthContext syncs immediately without full page reload
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
