import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getErrorMessage, toast } from '../../../shared/lib/toast';
import * as api from '../api/suppliers.api';
import { suppliersKeys } from './suppliers.keys';

export const useSuppliers = (filters) =>
  useQuery({
    queryKey: ['suppliers', 'list', filters],
    queryFn: () => api.getSuppliers(filters),
    placeholderData: keepPreviousData,
  });

export const useSupplierTypes = () =>
  useQuery({
    queryKey: ['supplier-types'],
    queryFn: api.getSupplierTypes,
  });

export const useSupplier = (id) =>
  useQuery({
    queryKey: suppliersKeys.detail(id),
    queryFn: () => api.getSupplier(id).then((res) => res.data),
    enabled: !!id,
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: suppliersKeys.all });
      toast.success('تم إنشاء المورد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء المورد'));
    },
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.deleteSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: suppliersKeys.all });
      toast.success('تم حذف المورد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف المورد'));
    },
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: suppliersKeys.all });
      qc.invalidateQueries({ queryKey: suppliersKeys.detail(variables.id) });
      toast.success('تم تحديث المورد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث المورد'));
    },
  });
};
