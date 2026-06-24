import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getJournalEntries,
  getJournalEntryById,
  getJournalEntryStatuses,
} from '../api/entries.api';

export const useJournalEntries = (filters) => {
  return useQuery({
    queryKey: ['journalEntries', filters],
    queryFn: () => getJournalEntries(filters),
    placeholderData: keepPreviousData,
  });
};

export const useJournalEntry = (id) => {
  return useQuery({
    queryKey: ['journalEntry', id],
    queryFn: () => getJournalEntryById(id),
    enabled: !!id,
  });
};

export const useJournalEntryStatuses = () => {
  return useQuery({
    queryKey: ['journalEntryStatuses'],
    queryFn: getJournalEntryStatuses,
  });
};
