import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankStatement } from '../api/bank-statement.api';
import { bankStatementKeys } from './bank-statement.keys';

export const useBankStatement = (filters) => {
  return useQuery({
    queryKey: bankStatementKeys.list(filters),
    queryFn: () => getBankStatement(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters?.bankAccountId,
  });
};