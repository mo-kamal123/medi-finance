import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getBankReconciliationById,
  getBankReconciliations,
  getReconciliationItems,
} from '../api/bank-reconciliations.api';
import { bankReconciliationsKeys } from './bank-reconciliations.keys';

export const useBankReconciliations = (filters = {}) => {
  return useQuery({
    queryKey: bankReconciliationsKeys.lists(filters),
    queryFn: () => getBankReconciliations(filters),
    placeholderData: keepPreviousData,
  });
};

export const useBankReconciliation = (id) => {
  return useQuery({
    queryKey: bankReconciliationsKeys.detail(id),
    queryFn: () => getBankReconciliationById(id),
    enabled: !!id,
    // Backend auto-adds posted moves inside [fromDate, toDate] on GET,
    // so always refetch when the screen opens / is returned to.
    refetchOnMount: 'always',
  });
};

export const useReconciliationItems = (id, filters = {}) => {
  return useQuery({
    queryKey: bankReconciliationsKeys.items(id, filters),
    queryFn: () => getReconciliationItems(id, filters),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
  });
};
