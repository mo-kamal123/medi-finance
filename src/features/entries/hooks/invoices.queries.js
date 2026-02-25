import { useQuery } from '@tanstack/react-query';
import { getJournalEntries } from '../api/entries.api';

export const useInvoices = (filters) => {
  return useQuery({
    queryKey: ['journalEntries', filters],
    queryFn: () => getJournalEntries(filters),
    keepPreviousData: true,
  });
};
