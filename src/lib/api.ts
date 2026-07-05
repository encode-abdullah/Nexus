// Axios API instance with JWT interceptor for backend communication
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('business_nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('business_nexus_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
