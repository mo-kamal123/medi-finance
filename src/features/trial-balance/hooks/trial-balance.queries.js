import { useQuery } from '@tanstack/react-query';
import { getTrialBalance } from '../api/trial-balance.api';
import { trialBalanceKeys } from './trial-balance.keys';

export const useTrialBalance = (filters) => {
  return useQuery({
    queryKey: trialBalanceKeys.list(filters),
    queryFn: () => getTrialBalance(filters),
  });
};