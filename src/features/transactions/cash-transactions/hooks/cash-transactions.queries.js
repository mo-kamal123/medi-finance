import { useQuery } from '@tanstack/react-query';
import {
  getAllCashTransactions,
  getCashTransactionById,
  getCashTransactionsBalance,
} from '../api/cash-transactions.api';
import { cashTransactionsKeys } from './cash-transactions.keys';

export const useCashTransactions = (filters) => {
  return useQuery({
    queryKey: cashTransactionsKeys.lists(filters),
    queryFn: () => getAllCashTransactions(filters),
    keepPreviousData: true,
  });
};

export const useCashTransactionsBalance = (filters) => {
  return useQuery({
    queryKey: cashTransactionsKeys.balance(filters),
    queryFn: () => getCashTransactionsBalance(filters),
  });
};

export const useCashTransaction = (id) => {
  return useQuery({
    queryKey: cashTransactionsKeys.detail(id),
    queryFn: () => getCashTransactionById(id),
    enabled: !!id,
  });
};
