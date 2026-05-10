import { useQuery } from '@tanstack/react-query';
import {
  getAllCommercialPapers,
  getAllCashVouchers,
  getBankAccountsList,
  getBanks,
  getBanksList,
  getCashVoucherById,
  getCommercialPaperById,
  getCurrencies,
  getFinancialPeriods,
} from '../api/commercial-papers.api';
import { commercialPapersKeys } from './commercial-papers.keys';

export const useCommercialPapers = (filters) => {
  return useQuery({
    queryKey: commercialPapersKeys.lists(filters),
    queryFn: () => getAllCommercialPapers(filters),
    keepPreviousData: true,
  });
};

export const useCommercialPaper = (id) => {
  return useQuery({
    queryKey: commercialPapersKeys.detail(id),
    queryFn: () => getCommercialPaperById(id),
    enabled: !!id,
  });
};

export const useBanks = () => {
  return useQuery({
    queryKey: commercialPapersKeys.banks(),
    queryFn: getBanks,
  });
};

export const useBanksList = () => {
  return useQuery({
    queryKey: commercialPapersKeys.banksList(),
    queryFn: getBanksList,
  });
};

export const useBankAccounts = (bankId) => {
  return useQuery({
    queryKey: commercialPapersKeys.bankAccounts(bankId),
    queryFn: () => getBankAccountsList(bankId),
    enabled: !!bankId,
  });
};

export const useCashVouchers = (filters) => {
  return useQuery({
    queryKey: commercialPapersKeys.cashVouchers(filters),
    queryFn: () => getAllCashVouchers(filters),
    keepPreviousData: true,
  });
};

export const useCashVoucher = (id) => {
  return useQuery({
    queryKey: commercialPapersKeys.cashVoucherDetail(id),
    queryFn: () => getCashVoucherById(id),
    enabled: !!id,
  });
};

export const useCurrencies = () => {
  return useQuery({
    queryKey: commercialPapersKeys.currencies(),
    queryFn: getCurrencies,
  });
};

export const useFinancialPeriods = () => {
  return useQuery({
    queryKey: commercialPapersKeys.financialPeriods(),
    queryFn: getFinancialPeriods,
  });
};
