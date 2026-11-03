import { axiosInstance } from '../../../app/api/axiosInstance';

export const login = (userData) => {
  return axiosInstance.post('/Auth/login', userData);
};

export const getCurrentUser = async (signal) => {
  const { data } = await axiosInstance.get('/Auth/me', { signal });
  if (!data?.permissions || typeof data.permissions !== 'object' || Array.isArray(data.permissions)) {
    throw new Error('Invalid current user permissions');
  }
  return data;
};
