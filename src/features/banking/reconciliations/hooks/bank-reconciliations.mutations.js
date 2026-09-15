import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBankReconciliation,
  finalizeReconciliation,
  ignoreReconciliationItem,
  matchReconciliationItem,
  reconcileLegacy,
  unmatchReconciliationItem,
} from '../api/bank-reconciliations.api';
import { bankReconciliationsKeys } from './bank-reconciliations.keys';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';

const invalidateReconciliation = (queryClient, reconciliationId) => {
  queryClient.invalidateQueries({ queryKey: bankReconciliationsKeys.all });
  if (reconciliationId) {
    queryClient.invalidateQueries({
      queryKey: bankReconciliationsKeys.detail(reconciliationId),
    });
    queryClient.invalidateQueries({
      queryKey: bankReconciliationsKeys.items(reconciliationId),
    });
  }
};

export const useCreateBankReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBankReconciliation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankReconciliationsKeys.all });
      toast.success('تم إنشاء التسوية بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء التسوية'));
    },
  });
};

export const useMatchReconciliationItem = (reconciliationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => matchReconciliationItem({ reconciliationId, ...payload }),
    onSuccess: () => {
      invalidateReconciliation(queryClient, reconciliationId);
      toast.success('تمت المطابقة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تنفيذ المطابقة'));
    },
  });
};

export const useUnmatchReconciliationItem = (reconciliationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => unmatchReconciliationItem({ reconciliationId, itemId }),
    onSuccess: () => {
      invalidateReconciliation(queryClient, reconciliationId);
      toast.success('تم إلغاء المطابقة بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إلغاء المطابقة'));
    },
  });
};

export const useIgnoreReconciliationItem = (reconciliationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, notes }) =>
      ignoreReconciliationItem({ reconciliationId, itemId, notes }),
    onSuccess: () => {
      invalidateReconciliation(queryClient, reconciliationId);
      toast.success('تم تجاهل البند بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تجاهل البند'));
    },
  });
};

export const useFinalizeReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => finalizeReconciliation(id),
    onSuccess: (_, id) => {
      invalidateReconciliation(queryClient, id);
      toast.success('تم اعتماد التسوية بنجاح');
    },
    onError: (error) => {
      // Show API message as-is (Arabic supported via detail)
      toast.error(getErrorMessage(error, 'تعذر اعتماد التسوية'));
    },
  });
};

export const useReconcileLegacy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => reconcileLegacy(id),
    onSuccess: (_, id) => {
      invalidateReconciliation(queryClient, id);
      toast.success('تم تنفيذ التسوية بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تنفيذ التسوية'));
    },
  });
};
