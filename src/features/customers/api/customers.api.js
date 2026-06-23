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

export const createCustomer = async (customer) => {
  const { data } = await axiosInstance.post('/customers', customer);
  return data;
};

export const updateCustomer = async (id, customer) => {
  const { data } = await axiosInstance.put(`/customers/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id) => {
  const { data } = await axiosInstance.delete(`/customers/${id}`);
  return data;
};

export const getCustomerTypes = () =>
  axiosInstance.get('/customer-types').then((res) => res.data);
