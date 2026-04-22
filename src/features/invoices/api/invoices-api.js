import { axiosInstance } from '../../../app/api/axiosInstance';

export const getAllInvoices = async (params = {}, type) => {
  const requestParams = {
    ...params,
  };

  if (type === 'customer') {
    requestParams.showOnlyCustomersInvoices = true;
    delete requestParams.showOnlySuppliersInvoices;
  }

  if (type === 'supplier') {
    requestParams.showOnlySuppliersInvoices = true;
    delete requestParams.showOnlyCustomersInvoices;
  }

  if (type === 'batch') {
    requestParams.hasBatchOnly = true;
    delete requestParams.showOnlyCustomersInvoices;
    delete requestParams.showOnlySuppliersInvoices;
  }

  const { data } = await axiosInstance.get('/invoices', {
    params: requestParams,
  });

  return data;
};

export const getInvoiceById = async (id) => {
  const response = await axiosInstance.get(`/invoices/${id}/with-journal`);
  return response.data;
};

export const getNextInvoiceNumber = async () => {
  const response = await axiosInstance.get('/invoices/next-number');
  return response.data;
};

export const createInvoice = async (formData) => {
  const { data } = await axiosInstance.post('/invoices', formData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};

export const getBatchByNumber = async (batchNumber) => {
  const { data } = await axiosInstance.get(`/batches/${batchNumber}`);
  return data;
};

export const createBatchInvoice = async (formData) => {
  const { data } = await axiosInstance.post('/batches/create-invoice', formData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};

export const updateInvoice = async ({ id, ...body }) => {
  const { data } = await axiosInstance.put(`/invoices/${id}`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};

export const getInvoiceTypes = async () => {
  const response = await axiosInstance.get('/invoice-types');
  return response.data;
};

export const getSuppliers = async () => {
  const response = await axiosInstance.get('/suppliers');
  return response.data;
};

export const getCustomers = async () => {
  const response = await axiosInstance.get('/customers');
  return response.data;
};

export const getFinancialPeriods = async () => {
  const response = await axiosInstance.get('/financial-periods');
  return response.data;
};

export const getProductsServices = async () => {
  const response = await axiosInstance.get('/products-services/dropdown');
  return response.data;
};
