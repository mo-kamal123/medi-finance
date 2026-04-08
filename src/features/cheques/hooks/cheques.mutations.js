import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCheque } from '../api/cheques.api';
import { chequesKeys } from './cheques.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chequesKeys.lists(),
      });
      toast.success('تم حفظ الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ الشيك'));
    },
  });
};
