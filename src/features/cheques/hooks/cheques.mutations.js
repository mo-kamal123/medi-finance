import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCheque,
  updateCheque,
  deleteCheque,
  postCheque,
  unpostCheque,
  depositChequeAtBank,
  collectCheque,
  returnCheque,
  cashCheque,
} from '../api/cheques.api';
import { chequesKeys } from './cheques.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
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

export const usePostCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
      toast.success('تم ترحيل الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر ترحيل الشيك'));
    },
  });
};

export const useUnpostCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpostCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
      toast.success('تم إلغاء ترحيل الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إلغاء ترحيل الشيك'));
    },
  });
};

export const useDepositCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: depositChequeAtBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
      toast.success('تم إيداع الشيك في البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إيداع الشيك'));
    },
  });
};

export const useCollectCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: collectCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
      toast.success('تم تحصيل الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحصيل الشيك'));
    },
  });
};

export const useReturnCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
      toast.success('تم إرجاع الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إرجاع الشيك'));
    },
  });
};

export const useCashCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cashCheque,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chequesKeys.all });
      toast.success('تم صرف الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر صرف الشيك'));
    },
  });
};
