import { axiosInstance } from '../../../app/api/axiosInstance';

export const getAllBanks = async (params) => {
  const { data } = await axiosInstance.get('/Banks', {
    params: {
      pageNumber: 1,
      pageSize: 20,
      ...params,
    },
  });

  return data;
};

export const getBankById = async (id) => {
  const { data } = await axiosInstance.get(`/Banks/${id}`);
  return data;
};

export const createBank = async (payload) => {
  const { data } = await axiosInstance.post('/Banks', payload);
  return data;
};
