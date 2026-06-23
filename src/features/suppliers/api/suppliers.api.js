import { axiosInstance } from '../../../app/api/axiosInstance';

export const getSuppliers = async (params = {}) => {
  const { data } = await axiosInstance.get('/suppliers', { params });
  return {
    items: Array.isArray(data?.data) ? data.data : [],
    totalCount: data.totalCount ?? 0,
    totalPages: data.totalPages ?? 1,
    pageNumber: data.pageNumber ?? 1,
    pageSize: data.pageSize ?? 20,
  };
};

export const getSupplier = (id) => axiosInstance.get(`/suppliers/${id}`);

export const createSupplier = (data) => axiosInstance.post('/suppliers', data);

export const updateSupplier = (id, data) =>
  axiosInstance.put(`/suppliers/${id}`, data);

export const deleteSupplier = (id) => axiosInstance.delete(`/suppliers/${id}`);

export const getSupplierTypes = () =>
  axiosInstance.get('/supplier-types').then((res) => res.data);
