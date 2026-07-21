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

export const getSupplier = async (id) => {
  const { data } = await axiosInstance.get(`/suppliers/${id}`);
  return data;
};

export const getSupplierStatuses = async () => {
  const { data } = await axiosInstance.get('/lookups/supplier-statuses');
  return Array.isArray(data) ? data : [];
};

export const getProviderClasses = async () => {
  const { data } = await axiosInstance.get('/lookups/provider-classes');
  return Array.isArray(data) ? data : [];
};

export const getImportanceLevels = async () => {
  const { data } = await axiosInstance.get('/lookups/importance-levels');
  return Array.isArray(data) ? data : [];
};

export const getGovernorates = async () => {
  const { data } = await axiosInstance.get('/lookups/governorates');
  return Array.isArray(data) ? data : [];
};
