import { axiosInstance } from '../../../../../app/api/axiosInstance';

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

export const getAccountsTree = async () => {
  const response = await axiosInstance.get('accounts/tree');
  return extractArray(response.data);
};

export const getAccountRoots = async (params = {}) => {
  const { data } = await axiosInstance.get('/accounts/roots', { params });
  return extractArray(data);
};

export const getAccountChildren = async (id) => {
  const { data } = await axiosInstance.get(`/accounts/${id}/children`);
  return extractArray(data);
};

export const getAccountById = async (id) => {
  const response = await axiosInstance.get(`accounts/${id}`);
  return response.data;
};

export const searchAccounts = async (params = {}) => {
  const { data } = await axiosInstance.get('/accounts/search', { params });
  return extractArray(data);
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
