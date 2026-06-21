import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBatchInvoice, createInvoice, updateInvoice } from '../api/invoices-api';
import { invoicesKeys } from './invoices.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: invoicesKeys.nextNumber(),
      });
      toast.success('تم إنشاء الفاتورة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء الفاتورة'));
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });

      if (variables?.id) {
        await queryClient.invalidateQueries({
          queryKey: invoicesKeys.detail(variables.id),
        });
      }

      toast.success('تم تحديث الفاتورة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث الفاتورة'));
    },
  });
};

export const useCreateBatchInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBatchInvoice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });
      toast.success('تم إنشاء فاتورة المطالبة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء فاتورة المطالبة'));
    },
  });
};
