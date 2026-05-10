import { useQuery } from '@tanstack/react-query';
import { getAgingReport } from '../api/aging-report.api';
import { agingReportKeys } from './aging-report.keys';

export const useAgingReport = (filters) => {
  return useQuery({
    queryKey: agingReportKeys.list(filters),
    queryFn: () => getAgingReport(filters),
    keepPreviousData: true,
  });
};
