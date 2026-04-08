import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJournalEntry, updateJournalEntry } from '../api/entries.api';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

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
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({
        queryKey: ['journalEntry', variables.id],
      });
      toast.success('تم تحديث القيد اليومي بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث القيد اليومي'));
    },
  });
};
