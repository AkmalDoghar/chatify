import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getBaseUrl();
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('chatify_user');
      if (user) {
        try {
          const { token } = JSON.parse(user);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Error parsing token from storage:', e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
