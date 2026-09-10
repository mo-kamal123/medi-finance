import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankBalances } from '../api/bank-balances.api';
import { bankBalancesKeys } from './bank-balances.keys';

export const useBankBalances = (filters) => {
  return useQuery({
    queryKey: bankBalancesKeys.list(filters),
    queryFn: () => getBankBalances(filters),
    placeholderData: keepPreviousData,
  });
};