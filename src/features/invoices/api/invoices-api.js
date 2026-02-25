import { axiosInstance } from '../../../app/api/axiosInstance';

// Get all invoices with filters
export const getAllInvoices = async (params) => {
  const { data } = await axiosInstance.get('/invoices', {
    params,
  });
  return data;
};

// Get invoice by ID
export const getInvoiceById = async (id) => {
  const response = await axiosInstance.get(`/invoices/${id}`);
  return response.data;
};

// Create invoice
export const createInvoice = async (formData) => {
  const { data } = await axiosInstance.post('/invoices', formData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};

// Update invoice
export const updateInvoice = async ({ id, body }) => {
  const { data } = await axiosInstance.put(`/invoices/${id}`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};

// Get invoice types
export const getInvoiceTypes = async () => {
  const response = await axiosInstance.get('/invoice-types');
  return response.data;
};

// Get suppliers
export const getSuppliers = async () => {
  const response = await axiosInstance.get('/suppliers');
  return response.data;
};

// Get customers
export const getCustomers = async () => {
  const response = await axiosInstance.get('/customers');
  return response.data;
};

// Get financial
export const getFinancialPeriods = async () => {
  const response = await axiosInstance.get('/financial-periods');
  return response.data;
};
