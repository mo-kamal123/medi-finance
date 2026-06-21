import { axiosInstance } from '../../../app/api/axiosInstance';

export const normalizeCashVouchersResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getAllCashVouchers = async (params = {}) => {
  const { data } = await axiosInstance.get('/cash-vouchers', { params });
  return normalizeCashVouchersResponse(data);
};

export const getCashVoucherById = async (id) => {
  const { data } = await axiosInstance.get(`/cash-vouchers/${id}`);
  return data;
};

export const createCashVoucher = async (payload) => {
  const { data } = await axiosInstance.post('/cash-vouchers', payload);
  return data;
};

export const getPaymentModes = async () => {
  const { data } = await axiosInstance.get('/cash-vouchers/payment-modes');
  return Array.isArray(data) ? data : data?.data || [];
};

export const getInvoiceForCashVoucher = async (invoiceNumber) => {
  const { data } = await axiosInstance.get('/invoices', {
    params: { invoiceNumber },
  });
  return data;
};
