import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request if one is stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses — but ONLY for protected routes.
//
// Auth endpoints (/auth/…) are expected to return 401 when
// credentials are wrong.  That is normal error flow and must
// be handled by the caller (AuthContext catch blocks).
// If we redirect here too, the page reloads before the catch
// runs and the user never sees the error message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/auth/');

    if (error.response?.status === 401 && !isAuthRoute) {
      // Session expired or invalid token on a protected route —
      // clear storage and send user back to login.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // For auth routes (or any non-401 error) just reject normally
    // so the caller's catch block receives it.
    return Promise.reject(error);
  }
);

export default api;