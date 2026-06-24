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

export const updateBank = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/Banks/${id}`, payload);
  return data;
};

export const getBankAccounts = async (bankId, params = {}) => {
  const { data } = await axiosInstance.get('/BankAccounts', {
    params: {
      pageNumber: 1,
      pageSize: 20,
      bankId,
      ...params,
    },
  });

  return data;
};

export const getBankAccountById = async (id) => {
  const { data } = await axiosInstance.get(`/BankAccounts/${id}`);
  return data;
};

export const deleteBank = async (id) => {
  const { data } = await axiosInstance.delete(`/Banks/${id}`);
  return data;
};

export const createBankAccount = async (payload) => {
  const { data } = await axiosInstance.post('/BankAccounts', payload);
  return data;
};

export const updateBankAccount = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/BankAccounts/${id}`, payload);
  return data;
};

export const deleteBankAccount = async (id) => {
  const { data } = await axiosInstance.delete(`/BankAccounts/${id}`);
  return data;
};
