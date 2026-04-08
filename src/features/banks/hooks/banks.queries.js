import { useQuery } from '@tanstack/react-query';
import { getAllBanks, getBankById } from '../api/banks.api';
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
