import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankChequesReport } from '../api/bank-cheques.api';
import { bankChequesReportKeys } from './bank-cheques.keys';

export const useBankChequesReport = (filters) => {
  return useQuery({
    queryKey: bankChequesReportKeys.list(filters),
    queryFn: () => getBankChequesReport(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters?.bankAccountId,
  });
};