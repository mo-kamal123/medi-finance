import { axiosInstance } from '../../../app/api/axiosInstance';

export const getCashTransactionsBalance = async (params = {}) => {
  const { data } = await axiosInstance.get('/cash-transactions/balance', { params });
  return data;
};

export const getAllCashTransactions = async (params = {}) => {
  const { data } = await axiosInstance.get('/cash-transactions', {
    params: {
      pageNumber: 1,
      pageSize: 50,
      sortBy: 'EntryDate',
      sortDirection: 'DESC',
      ...params,
    },
  });
  return data;
};

export const getCashTransactionById = async (id) => {
  const { data } = await axiosInstance.get(`/cash-transactions/${id}`);
  return data;
};

export const createCashTransaction = async (payload) => {
  const { data } = await axiosInstance.post('/cash-transactions', payload);
  return data;
};

export const updateCashTransaction = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cash-transactions/${id}`, payload);
  return data;
};

export const deleteCashTransaction = async ({ id, reason }) => {
  const { data } = await axiosInstance.delete(`/cash-transactions/${id}`, {
    params: { reason },
  });
  return data;
};
