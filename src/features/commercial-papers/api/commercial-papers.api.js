import { axiosInstance } from '../../../app/api/axiosInstance';

const CREATE_ENDPOINTS = {
  RECEIVABLE: '/commercial-papers/notes-receivable',
  PAYABLE: '/commercial-papers/notes-payable',
};

export const getAllCommercialPapers = async (params) => {
  const { data } = await axiosInstance.get('/commercial-papers', {
    params,
  });
  return data;
};

export const getCommercialPaperById = async (id) => {
  const { data } = await axiosInstance.get(`/commercial-papers/${id}`);
  return data;
};

export const getBanks = async () => {
  const { data } = await axiosInstance.get('/Banks', {
    params: {
      pageNumber: 1,
      pageSize: 20,
    },
  });
  return data;
};

export const getCurrencies = async () => {
  const { data } = await axiosInstance.get('/currencies');
  return data;
};

export const getFinancialPeriods = async () => {
  const { data } = await axiosInstance.get('/financial-periods');
  return data;
};

export const createCommercialPaper = async ({ paperType, ...payload }) => {
  const endpoint = CREATE_ENDPOINTS[paperType];

  if (!endpoint) {
    throw new Error(`Unsupported paper type: ${paperType}`);
  }

  const { data } = await axiosInstance.post(endpoint, payload);
  return data;
};

export const updateCommercialPaper = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/commercial-papers/${id}`, payload);
  return data;
};

export const deleteCommercialPaper = async (id) => {
  const { data } = await axiosInstance.delete(`/commercial-papers/${id}`);
  return data;
};
