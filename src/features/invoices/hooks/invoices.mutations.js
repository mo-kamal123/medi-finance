import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInvoice, updateInvoice } from '../api/invoices-api';
import { invoicesKeys } from './invoices.keys';

/* ===========================
   CREATE
=========================== */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });
    },
  });
};

/* ===========================
   UPDATE
=========================== */
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoicesKeys.lists(),
      });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: invoicesKeys.detail(variables.id),
        });
      }
    },
  });
};
