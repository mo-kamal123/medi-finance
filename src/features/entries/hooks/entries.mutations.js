import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createJournalEntry,
  postJournalEntry,
  reverseJournalEntry,
  updateJournalEntry,
} from '../api/entries.api';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

const invalidateEntryQueries = (queryClient, id) => {
  queryClient.invalidateQueries({ queryKey: ['journalEntries'] });

  if (id) {
    queryClient.invalidateQueries({ queryKey: ['journalEntry', id] });
  }
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      toast.success('تم حفظ القيد اليومي بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ القيد اليومي'));
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateJournalEntry,
    onSuccess: (_, variables) => {
      invalidateEntryQueries(queryClient, variables.id);
      toast.success('تم تحديث القيد اليومي بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث القيد اليومي'));
    },
  });
};

export const usePostJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postJournalEntry,
    onSuccess: (_, variables) => {
      invalidateEntryQueries(queryClient, variables.id);
      toast.success('تم ترحيل القيد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر ترحيل القيد'));
    },
  });
};

export const useReverseJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reverseJournalEntry,
    onSuccess: (_, variables) => {
      invalidateEntryQueries(queryClient, variables.id);
      toast.success('تم عكس القيد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر عكس القيد'));
    },
  });
};
