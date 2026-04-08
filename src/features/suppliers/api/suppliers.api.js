import { axiosInstance } from '../../../app/api/axiosInstance';

export const getSuppliers = () => axiosInstance.get('/suppliers');

export const getSupplier = (id) => axiosInstance.get(`/suppliers/${id}`);

export const createSupplier = (data) => axiosInstance.post('/suppliers', data);

export const updateSupplier = (id, data) =>
  axiosInstance.put(`/suppliers/${id}`, data);

export const deleteSupplier = (id) => axiosInstance.delete(`/suppliers/${id}`);
