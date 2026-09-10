import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankCashFlow } from '../api/cash-flow.api';
import { bankCashFlowKeys } from './cash-flow.keys';

export const useBankCashFlow = (filters) => {
  return useQuery({
    queryKey: bankCashFlowKeys.list(filters),
    queryFn: () => getBankCashFlow(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters?.bankID,
  });
};