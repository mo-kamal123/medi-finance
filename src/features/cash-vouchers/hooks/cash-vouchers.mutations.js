import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCashVoucher } from '../api/cash-vouchers.api';
import { cashVouchersKeys } from './cash-vouchers.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateCashVoucher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashVoucher,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cashVouchersKeys.lists(),
      });
      toast.success('تم إنشاء سند الصرف أو القبض بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء السند'));
    },
  });
};
