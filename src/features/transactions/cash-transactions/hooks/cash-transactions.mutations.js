import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCashTransaction,
  deleteCashTransaction,
  updateCashTransaction,
} from '../api/cash-transactions.api';
import { cashTransactionsKeys } from './cash-transactions.keys';

export const useCreateCashTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashTransactionsKeys.all });
    },
  });
};

export const useUpdateCashTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCashTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cashTransactionsKeys.all });
      queryClient.invalidateQueries({ queryKey: cashTransactionsKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCashTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCashTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashTransactionsKeys.all });
    },
  });
};
