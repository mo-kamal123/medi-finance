import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from '../api/customers.api';
import { customersKeys } from './customers.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries(customersKeys.lists());
      toast.success('تم إنشاء العميل بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء العميل'));
    },
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries(customersKeys.lists());
      toast.success('تم تحديث العميل بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث العميل'));
    },
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries(customersKeys.lists());
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف العميل'));
    },
  });
};
