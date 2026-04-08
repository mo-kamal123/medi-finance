import { axiosInstance } from '../../../app/api/axiosInstance';

export const getTrialBalance = async (params) => {
  const { data } = await axiosInstance.get('/trial-balance', { params });
  return data;
};
