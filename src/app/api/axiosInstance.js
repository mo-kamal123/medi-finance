import axios from 'axios';
import { store } from '../store/store';
import { clearCredentials } from '../../features/auth/store/auth-slice';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let redirectingToLogin = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = /\/Auth\/login\/?$/i.test(error.config?.url || '');

    // A rejected login should stay on the form so its error can be displayed.
    const isAuthorizationError =
      error.response?.status === 401 || error.response?.status === 403;
    if (isAuthorizationError && !isLoginRequest && !redirectingToLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      store.dispatch(clearCredentials());

      if (!/^\/auth(?:\/|$)/.test(window.location.pathname)) {
        redirectingToLogin = true;
        window.location.replace('/auth?sessionExpired=1');
      }
    }

    return Promise.reject(error);
  }
);
