import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankReconciliation } from '../api/bank-reconciliation.api';
import { bankReconciliationKeys } from './bank-reconciliation.keys';

export const useBankReconciliation = (filters) => {
  return useQuery({
    queryKey: bankReconciliationKeys.list(filters),
    queryFn: () => getBankReconciliation(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters?.bankAccountID,
  });
};