import { axiosInstance } from '../../../../app/api/axiosInstance';

export const getAccountsTree = async () => {
  const response = await axiosInstance.get('accounts/tree');
  return response.data;
};

export const getAccountRoots = async (params = {}) => {
  const { data } = await axiosInstance.get('/accounts/roots', { params });
  return data;
};

export const getAccountChildren = async (id) => {
  const { data } = await axiosInstance.get(`/accounts/${id}/children`);
  return data;
};

export const getAccountById = async (id) => {
  const response = await axiosInstance.get(`accounts/${id}`);
  return response.data;
};

export const searchAccounts = async (params = {}) => {
  const { data } = await axiosInstance.get('/accounts/search', { params });
  return data;
};

// Create account
export const createAccount = async (formData) => {
  const { data } = await axiosInstance.post('/accounts', formData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
// Update
export const updateAccount = async ({ id, body }) => {
  const { data } = await axiosInstance.put(`/accounts/${id}`, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
};
