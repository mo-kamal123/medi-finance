import { useQuery } from '@tanstack/react-query';
import {
  getAllBanks,
  getBankAccounts,
  getBankAccountById,
  getBankById,
} from '../api/banks.api';
import { banksKeys } from './banks.keys';

export const useBanks = (filters) => {
  return useQuery({
    queryKey: banksKeys.lists(filters),
    queryFn: () => getAllBanks(filters),
    keepPreviousData: true,
  });
};

export const useBank = (id) => {
  return useQuery({
    queryKey: banksKeys.detail(id),
    queryFn: () => getBankById(id),
    enabled: !!id,
  });
};

export const useBankAccounts = (bankId) => {
  return useQuery({
    queryKey: banksKeys.accounts(bankId),
    queryFn: () => getBankAccounts(bankId),
    enabled: !!bankId,
  });
};

export const useBankAccount = (id) => {
  return useQuery({
    queryKey: banksKeys.accountDetail(id),
    queryFn: () => getBankAccountById(id),
    enabled: !!id,
  });
};
