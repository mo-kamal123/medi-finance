import { axiosInstance } from '../../../../app/api/axiosInstance';

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

export const getOperationTypes = async () => {
  const { data } = await axiosInstance.get('/operation-types');
  return Array.isArray(data) ? data : [];
};

export const getNetworks = async () => {
  const { data } = await axiosInstance.get('/networks');
  return Array.isArray(data) ? data : [];
};

export const getPrograms = async () => {
  const { data } = await axiosInstance.get('/programs');
  return Array.isArray(data) ? data : [];
};

export const getPaymentStatuses = async () => {
  const { data } = await axiosInstance.get('/payment-statuses');
  return Array.isArray(data) ? data : [];
};

export const updateSupplierFinanceInfo = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.patch(
    `/suppliers/${id}/finance-info`,
    payload
  );
  return data;
};
