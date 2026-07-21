import { useQuery } from '@tanstack/react-query';
import {
  getTrialBalanceRoots,
  getTrialBalanceChildren,
} from '../api/trial-balance.api';
import { trialBalanceKeys } from './trial-balance.keys';

export const useTrialBalanceRoots = (filters) => {
  return useQuery({
    queryKey: trialBalanceKeys.roots(filters),
    queryFn: () => getTrialBalanceRoots(filters),
  });
};

export const useTrialBalanceChildren = (accountId, filters) => {
  return useQuery({
    queryKey: trialBalanceKeys.children(accountId, filters),
    queryFn: () => getTrialBalanceChildren(accountId, filters),
    enabled: !!accountId,
  });
};
