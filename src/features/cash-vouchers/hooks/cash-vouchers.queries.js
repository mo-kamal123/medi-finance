import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAllCashVouchers,
  getCashVoucherById,
  getCashVoucherStatuses,
} from '../api/cash-vouchers.api';
import { cashVouchersKeys } from './cash-vouchers.keys';

export const useCashVouchers = (filters) => {
  return useQuery({
    queryKey: cashVouchersKeys.lists(filters),
    queryFn: () => getAllCashVouchers(filters),
    placeholderData: keepPreviousData,
  });
};

export const useCashVoucher = (id) => {
  return useQuery({
    queryKey: cashVouchersKeys.detail(id),
    queryFn: () => getCashVoucherById(id),
    enabled: !!id,
  });
};

export const useCashVoucherStatuses = () => {
  return useQuery({
    queryKey: cashVouchersKeys.statuses(),
    queryFn: getCashVoucherStatuses,
  });
};


