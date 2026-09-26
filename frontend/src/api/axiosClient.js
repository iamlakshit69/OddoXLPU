import axios from 'axios';

// The local backend serves endpoints on /api/v1 or /api
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stocksense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors & 401 unauth
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    // If unauthorized, clean up token
    if (error.response?.status === 401) {
      localStorage.removeItem('stocksense_token');
      localStorage.removeItem('stocksense_user');
      if (!window.location.pathname.startsWith('/auth')) {
        // window.location.href = '/auth/login';
      }
    }

    return Promise.reject(new Error(errorMsg));
  }
);

export default axiosClient;
