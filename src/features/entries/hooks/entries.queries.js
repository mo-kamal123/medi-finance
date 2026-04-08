import { useQuery } from '@tanstack/react-query';
import { getJournalEntries, getJournalEntryById } from '../api/entries.api';

export const useJournalEntries = (filters) => {
  return useQuery({
    queryKey: ['journalEntries', filters],
    queryFn: () => getJournalEntries(filters),
    keepPreviousData: true,
  });
};

export const useJournalEntry = (id) => {
  return useQuery({
    queryKey: ['journalEntry', id],
    queryFn: () => getJournalEntryById(id),
    enabled: !!id,
  });
};
