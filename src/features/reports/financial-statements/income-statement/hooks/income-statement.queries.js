import { useQuery } from '@tanstack/react-query';
import { getIncomeStatement } from '../api/income-statement.api';
import { incomeStatementKeys } from './income-statement.keys';

export const useIncomeStatement = (filters) => {
  return useQuery({
    queryKey: incomeStatementKeys.list(filters),
    queryFn: () => getIncomeStatement(filters),
  });
};
