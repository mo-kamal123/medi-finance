import { axiosInstance } from '../../../app/api/axiosInstance';

export const normalizeCashVouchersResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getAllCashVouchers = async (params = {}) => {
  const { data } = await axiosInstance.get('/cash-vouchers', { params });
  return {
    items: normalizeCashVouchersResponse(data),
    totalCount: data.totalCount ?? 0,
    totalPages: data.totalPages ?? 1,
    pageNumber: data.pageNumber ?? 1,
    pageSize: data.pageSize ?? 10,
  };
};

export const getCashVoucherById = async (id) => {
  const { data } = await axiosInstance.get(`/cash-vouchers/${id}`);
  return data;
};

export const createCashVoucher = async (payload) => {
  const { data } = await axiosInstance.post('/cash-vouchers', payload);
  return data;
};

export const updateCashVoucher = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/cash-vouchers/${id}`, payload);
  return data;
};

export const getInvoiceForCashVoucher = async (invoiceNumber) => {
  const { data } = await axiosInstance.get(
    `/cash-vouchers/invoice-details/${invoiceNumber}`
  );
  return data;
};
