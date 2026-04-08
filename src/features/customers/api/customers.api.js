import { axiosInstance } from '../../../app/api/axiosInstance';

export const getCustomers = async () => {
  const { data } = await axiosInstance.get('/customers');
  return data;
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
