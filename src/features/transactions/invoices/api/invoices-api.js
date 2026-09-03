import { axiosInstance } from '../../../../app/api/axiosInstance';

export const normalizeInvoicesResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const normalizePaginatedResponse = (response) => {
  const items = normalizeInvoicesResponse(response);
  return {
    items,
    totalCount: response?.totalCount ?? items.length,
    totalPages: response?.totalPages ?? Math.max(1, Math.ceil((response?.totalCount ?? items.length) / (response?.pageSize || 10))),
    pageNumber: response?.pageNumber ?? 1,
    pageSize: response?.pageSize ?? 10,
  };
};

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

  return normalizePaginatedResponse(data);
};

export const getInvoiceById = async (id) => {
  const { data } = await axiosInstance.get(`/invoices/${id}`);
  return data;
};

export const getInvoiceByNumber = async (invoiceNumber) => {
  const { data } = await axiosInstance.get(`/invoices/by-number/${invoiceNumber}`);
  return data;
};

export const getInvoiceStatuses = async () => {
  const { data } = await axiosInstance.get('/invoices/statuses');
  return Array.isArray(data) ? data : data?.data || [];
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

export const deleteInvoice = async (id) => {
  const { data } = await axiosInstance.delete(`/invoices/${id}`);
  return data;
};

export const getInvoiceTypes = async () => {
  const response = await axiosInstance.get('/invoice-types');
  return normalizeInvoicesResponse(response.data);
};

export const getCustomers = async () => {
  const response = await axiosInstance.get('/customers');
  return normalizeInvoicesResponse(response.data);
};

export const getSuppliers = async () => {
  const response = await axiosInstance.get('/suppliers');
  return normalizeInvoicesResponse(response.data);
};

export const getFinancialPeriods = async () => {
  const response = await axiosInstance.get('/financial-periods');
  return normalizeInvoicesResponse(response.data);
};

export const getProductsServices = async () => {
  const response = await axiosInstance.get('/products-services/dropdown');
  return normalizeInvoicesResponse(response.data);
};

export const payInvoice = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.post(`/invoices/${id}/pay`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
