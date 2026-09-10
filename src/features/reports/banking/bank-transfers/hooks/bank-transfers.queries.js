import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getBankTransfersReport } from '../api/bank-transfers.api';
import { bankTransfersReportKeys } from './bank-transfers.keys';

export const useBankTransfersReport = (filters) => {
  return useQuery({
    queryKey: bankTransfersReportKeys.list(filters),
    queryFn: () => getBankTransfersReport(filters),
    placeholderData: keepPreviousData,
  });
};