import { axiosInstance } from '../../../app/api/axiosInstance';

export const getCustomers = async (params = {}) => {
  const { data } = await axiosInstance.get('/customers', { params });
  return {
    items: Array.isArray(data?.data) ? data.data : [],
    totalCount: data.totalCount ?? 0,
    totalPages: data.totalPages ?? 1,
    pageNumber: data.pageNumber ?? 1,
    pageSize: data.pageSize ?? 20,
  };
};

export const getCustomerById = async (id) => {
  const { data } = await axiosInstance.get(`/customers/${id}`);
  return data;
};
