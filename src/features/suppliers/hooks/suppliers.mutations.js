import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/suppliers.api';
import { suppliersKeys } from './suppliers.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useUpdateSupplierFinanceInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateSupplierFinanceInfo,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: suppliersKeys.detail(variables.id),
      });
      toast.success('تم تحديث المعلومات المالية بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث المعلومات المالية'));
    },
  });
};
