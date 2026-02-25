import { axiosInstance } from '../../../app/api/axiosInstance';

export const login = (userData) => {
  return axiosInstance.post('/Auth/login', userData);
};
