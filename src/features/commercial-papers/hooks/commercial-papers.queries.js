import { useQuery } from '@tanstack/react-query';
import {
  getAllCommercialPapers,
  getBanks,
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
