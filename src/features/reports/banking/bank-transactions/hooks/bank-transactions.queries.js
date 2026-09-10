import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankTransactionsReport } from '../api/bank-transactions.api';
import { bankTransactionsReportKeys } from './bank-transactions.keys';

export const useBankTransactionsReport = (filters) => {
  return useQuery({
    queryKey: bankTransactionsReportKeys.list(filters),
    queryFn: () => getBankTransactionsReport(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters?.bankAccountId,
  });
};