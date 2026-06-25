import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAllBanks,
  getBankAccounts,
  getAllBankAccounts,
  getBankAccountById,
  getBankById,
} from '../api/banks.api';
import { banksKeys } from './banks.keys';

export const useBanks = (filters) => {
  return useQuery({
    queryKey: banksKeys.lists(filters),
    queryFn: () => getAllBanks(filters),
    placeholderData: keepPreviousData,
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

export const useAllBankAccounts = () => {
  return useQuery({
    queryKey: ['all-bank-accounts'],
    queryFn: getAllBankAccounts,
  });
};

export const useBankAccount = (id) => {
  return useQuery({
    queryKey: banksKeys.accountDetail(id),
    queryFn: () => getBankAccountById(id),
    enabled: !!id,
  });
};
