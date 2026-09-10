import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getOutstandingCheques } from '../api/outstanding-cheques.api';
import { outstandingChequesKeys } from './outstanding-cheques.keys';

export const useOutstandingCheques = (filters) => {
  return useQuery({
    queryKey: outstandingChequesKeys.list(filters),
    queryFn: () => getOutstandingCheques(filters),
    placeholderData: keepPreviousData,
    enabled: !!filters?.bankAccountID,
  });
};