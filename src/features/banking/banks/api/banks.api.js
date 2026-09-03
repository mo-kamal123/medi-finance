import { axiosInstance } from '../../../../app/api/axiosInstance';

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const checks = ['data', 'items', 'list', '$values', 'records', 'rows', 'result'];
  for (const key of checks) {
    const val = data[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      for (const sub of checks) {
        if (Array.isArray(val[sub])) return val[sub];
      }
    }
  }
  const found = Object.values(data).find(Array.isArray);
  return found || [];
};

export const getAllBanks = async (params) => {
  try {
    const { data } = await axiosInstance.get('/Banks', {
      params: {
        pageNumber: 1,
        pageSize: 20,
        ...params,
      },
    });
    return extractArray(data);
  } catch {
    return [];
  }
};

export const getBankById = async (id) => {
  try {
    const { data } = await axiosInstance.get(`/Banks/${id}`);
    return data;
  } catch {
    return null;
  }
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
  return extractArray(data);
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

export const getAllBankAccounts = async (params = {}) => {
  const { data } = await axiosInstance.get('/BankAccounts', {
    params: { pageNumber: 1, pageSize: 100, ...params },
  });
  return data;
};

const normalizePaged = (data, fallbackPageSize = 20) => {
  const items = extractArray(data);
  return {
    items,
    totalCount: Number(data?.totalCount ?? items.length) || 0,
    pageNumber: Number(data?.pageNumber ?? 1) || 1,
    pageSize: Number(data?.pageSize ?? fallbackPageSize) || fallbackPageSize,
  };
};

export const getBankTransactions = async (params = {}) => {
  const { data } = await axiosInstance.get('/bank-transactions', { params });
  return normalizePaged(data, params.pageSize ?? 20);
};

export const getBankTransactionFilterOptions = async (type) => {
  const { data } = await axiosInstance.get(`/bank-transactions/${type}`);
  return extractArray(data);
};
