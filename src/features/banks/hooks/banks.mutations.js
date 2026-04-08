import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBank } from '../api/banks.api';
import { banksKeys } from './banks.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banksKeys.all });
      toast.success('تم حفظ البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ البنك'));
    },
  });
};
