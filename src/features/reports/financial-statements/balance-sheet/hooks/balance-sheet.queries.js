import { useQuery } from '@tanstack/react-query';
import { getBalanceSheet } from '../api/balance-sheet.api';
import { balanceSheetKeys } from './balance-sheet.keys';

export const useBalanceSheet = (filters) => {
  return useQuery({
    queryKey: balanceSheetKeys.list(filters),
    queryFn: () => getBalanceSheet(filters),
  });
};
