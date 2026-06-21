import { useQuery } from '@tanstack/react-query';
import {
  getAllCashVouchers,
  getCashVoucherById,
  getPaymentModes,
} from '../api/cash-vouchers.api';
import { cashVouchersKeys } from './cash-vouchers.keys';

export const useCashVouchers = (filters) => {
  return useQuery({
    queryKey: cashVouchersKeys.lists(filters),
    queryFn: () => getAllCashVouchers(filters),
    keepPreviousData: true,
  });
};

export const useCashVoucher = (id) => {
  return useQuery({
    queryKey: cashVouchersKeys.detail(id),
    queryFn: () => getCashVoucherById(id),
    enabled: !!id,
  });
};

export const usePaymentModes = () => {
  return useQuery({
    queryKey: cashVouchersKeys.paymentModes(),
    queryFn: getPaymentModes,
  });
};
