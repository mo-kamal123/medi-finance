// Invoice react-query mutation hooks.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeBatch, createBatchInvoice, createInvoice, deleteInvoice, updateInvoice } from '../api/invoices-api';
import { invoicesKeys } from './invoices.keys';
import { getErrorMessage, toast } from '../../../../../shared/lib/toast';

export const useCloseBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeBatch,
    retry: false,
    onSuccess: async (_, batchNumber) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: invoicesKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: invoicesKeys.details() }),
        queryClient.invalidateQueries({ queryKey: invoicesKeys.batch(batchNumber) }),
        queryClient.invalidateQueries({ queryKey: ['batches', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['journalEntries'] }),
        queryClient.invalidateQueries({ queryKey: ['journalEntry'] }),
      ]);
      toast.success('تم إنشاء قيد إقفال الدفعة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء قيد إقفال الدفعة'));
    },
  });
};

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

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });
      toast.success('تم حذف الفاتورة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف الفاتورة'));
    },
  });
};

export const useCreateBatchInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBatchInvoice,
    onSuccess: async (_, payload) => {
      await queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['batches', 'list'] }),
        queryClient.invalidateQueries({ queryKey: invoicesKeys.batch(payload.batchNumber) }),
      ]);
      toast.success('تم إنشاء فاتورة المطالبة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء فاتورة المطالبة'));
    },
  });
};
