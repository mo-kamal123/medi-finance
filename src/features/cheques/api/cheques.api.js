import { axiosInstance } from '../../../app/api/axiosInstance';

export const getAllCheques = async (params) => {
  const { data } = await axiosInstance.get('/cheques', {
    params,
  });
  return data;
};

export const getChequeById = async (id) => {
  const { data } = await axiosInstance.get(`/cheques/${id}`);
  return data;
};

export const createCheque = async (payload) => {
  const { data } = await axiosInstance.post('/cheques', payload);
  return data;
};

export const getChequeBanks = async () => {
  const { data } = await axiosInstance.get('/Banks', {
    params: {
      pageNumber: 1,
      pageSize: 20,
    },
  });
  return data;
};

export const getChequeCustomers = async () => {
  const { data } = await axiosInstance.get('/customers');
  return data;
};
