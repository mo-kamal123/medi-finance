import { axiosInstance } from '../../../app/api/axiosInstance';

import { getInvoiceByNumber } from '../../invoices/api/invoices-api';

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

export const getAllCheques = async (params) => {
  const { data } = await axiosInstance.get('/cheques', { params });
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

export const updateCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}`, payload);
  return data;
};

export const deleteCheque = async (id) => {
  const { data } = await axiosInstance.delete(`/cheques/${id}`);
  return data;
};

export const getChequeStatuses = async () => {
  const { data } = await axiosInstance.get('/cheques/statuses');
  return data;
};

export const getPendingCheques = async (params) => {
  const { data } = await axiosInstance.get('/cheques/pending', { params });
  return data;
};

export const postCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/post`, payload);
  return data;
};

export const unpostCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/unpost`, payload);
  return data;
};

export const depositChequeAtBank = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/deposit-at-bank`, payload);
  return data;
};

export const collectCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/collect`, payload);
  return data;
};

export const returnCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/return`, payload);
  return data;
};

export const cashCheque = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cheques/${id}/cash`, payload);
  return data;
};

export const getChequeBanks = async () => {
  const res = await axiosInstance.get('/Banks', {
    params: { pageNumber: 1, pageSize: 20 },
  });
  return extractArray(res.data);
};

export const getChequeCustomers = async () => {
  const { data } = await axiosInstance.get('/customers', {
    params: { pageNumber: 1, pageSize: 200 },
  });
  return extractArray(data);
};

export const getSupplierList = async () => {
  const { data } = await axiosInstance.get('/suppliers', {
    params: { pageNumber: 1, pageSize: 200 },
  });
  return extractArray(data);
};

export const getCurrencies = async () => {
  const { data } = await axiosInstance.get('/currencies');
  return extractArray(data);
};

export { getInvoiceByNumber };
