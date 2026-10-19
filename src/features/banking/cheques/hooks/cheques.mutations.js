import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCheque,
  updateCheque,
  deleteCheque,
  updateChequeStatus,
  uploadChequeAttachment,
} from '../api/cheques.api';
import { chequesKeys } from './cheques.keys';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';
import { getChequeErrorMessage } from '../utils/cheque-payload';

const invalidateInvoiceBalances = (queryClient) => {
  for (const queryKey of [['cheques', 'eligible-invoices'], ['invoices'], ['batches']]) {
    queryClient.invalidateQueries({ queryKey });
  }
};

export const useUploadChequeAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadChequeAttachment,
    retry: false,
    onSuccess: async (_, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chequesKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: ['cheques', 'list'] }),
      ]);
      toast.success('تم رفع مرفق الشيك بنجاح');
    },
  });
};

export const useCreateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheque,
    onSuccess: () => {
      invalidateInvoiceBalances(queryClient);
      queryClient.invalidateQueries({ queryKey: chequesKeys.lists() });
      toast.success('تم حفظ الشيك بنجاح');
    },
    onError: (error) => {
      toast.error(getChequeErrorMessage(error));
    },
  });
};

export const useUpdateCheque = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCheque,
    onSuccess: (_, variables) => {
      invalidateInvoiceBalances(queryClient);
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
      invalidateInvoiceBalances(queryClient);
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
      invalidateInvoiceBalances(queryClient);
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
