import { axiosInstance } from '../../../../app/api/axiosInstance';

export const getAccountsTree = async () => {
  const response = await axiosInstance.get('accounts/tree');
  return response.data;
};

export const getAccountById = async (id) => {
  const response = await axiosInstance.get(`accounts/${id}`);
  return response.data;
};

// Create account
export const createAccount = async (formData) => {
  const { data } = await axiosInstance.post('/accounts', formData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
// Update
export const updateAccount = async ({ body }) => {
  const { data } = await axiosInstance.post(`/accounts`, body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
};
