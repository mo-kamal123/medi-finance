import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCheque,
  updateCheque,
  deleteCheque,
  updateChequeStatus,
} from '../api/cheques.api';
import { chequesKeys } from './cheques.keys';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';

export const useCreateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.lists() });
      toast.success('تم حفظ الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ الشيك'));
    },
  });
};

export const useUpdateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCheque,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.lists() });
      if (variables?.id !== null && variables?.id !== undefined) {
        queryClient.invalidateQueries({
          queryKey: chequesKeys.detail(variables.id),
        });
      }
      toast.success('تم تحديث الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث الشيك'));
    },
  });
};

export const useDeleteCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.lists() });
      toast.success('تم حذف الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف الشيك'));
    },
  });
};

export const useUpdateChequeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChequeStatus,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.lists() });
      if (variables?.id !== null && variables?.id !== undefined) {
        queryClient.invalidateQueries({
          queryKey: chequesKeys.detail(variables.id),
        });
      }
      toast.success('تم تحديث حالة الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث حالة الشيك'));
    },
  });
};
