import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBank,
  updateBank,
  deleteBank,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from '../api/banks.api';
import { banksKeys } from './banks.keys';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';

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

export const useUpdateBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBank,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: banksKeys.all });
      queryClient.invalidateQueries({ queryKey: banksKeys.detail(variables.id) });
      toast.success('تم تحديث البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث البنك'));
    },
  });
};

export const useDeleteBank = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banksKeys.all });
      toast.success('تم حذف البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف البنك'));
    },
  });
};

export const useCreateBankAccount = (bankId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banksKeys.accounts(bankId) });
      queryClient.invalidateQueries({ queryKey: banksKeys.detail(bankId) });
      toast.success('تم حفظ حساب البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حفظ حساب البنك'));
    },
  });
};

export const useUpdateBankAccount = (bankId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBankAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: banksKeys.accounts(bankId) });
      queryClient.invalidateQueries({ queryKey: banksKeys.accountDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: banksKeys.detail(bankId) });
      toast.success('تم تحديث حساب البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث حساب البنك'));
    },
  });
};

export const useDeleteBankAccount = (bankId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBankAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: banksKeys.accounts(bankId) });
      queryClient.invalidateQueries({ queryKey: banksKeys.detail(bankId) });
      toast.success('تم حذف حساب البنك بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف حساب البنك'));
    },
  });
};
