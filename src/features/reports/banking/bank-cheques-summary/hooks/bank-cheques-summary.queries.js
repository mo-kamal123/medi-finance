import { useQuery } from '@tanstack/react-query';
import { getBankChequesSummary } from '../api/bank-cheques-summary.api';
import { bankChequesSummaryKeys } from './bank-cheques-summary.keys';

export const useBankChequesSummary = (filters) => {
  return useQuery({
    queryKey: bankChequesSummaryKeys.list(filters),
    queryFn: () => getBankChequesSummary(filters),
    enabled: !!filters?.bankId,
  });
};