import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBank, saveBankAccount } from '../api/banks.api';
import { banksKeys } from './banks.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banksKeys.all });
      toast.success('تم حفظ البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ البنك'));
    },
  });
};

export const useSaveBankAccount = (bankId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBankAccount,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: banksKeys.accounts(bankId) });
      if (variables?.bankAccountID) {
        queryClient.invalidateQueries({
          queryKey: banksKeys.accountDetail(String(variables.bankAccountID)),
        });
      }
      toast.success('تم حفظ حساب البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ حساب البنك'));
    },
  });
};
