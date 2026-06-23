import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, toast } from '../../../shared/lib/toast';
import * as api from '../api/suppliers.api';

export const useSuppliers = (filters) =>
  useQuery({
    queryKey: ['suppliers', 'list', filters],
    queryFn: () => api.getSuppliers(filters),
    keepPreviousData: true,
  });

export const useSupplierTypes = () =>
  useQuery({
    queryKey: ['supplier-types'],
    queryFn: api.getSupplierTypes,
  });

export const useSupplier = (id) =>
  useQuery({
    queryKey: ['supplier', id],
    queryFn: () => api.getSupplier(id).then((res) => res.data),
    enabled: !!id,
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('تم إنشاء المورد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء المورد'));
    },
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.updateSupplier(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('تم تحديث المورد بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث المورد'));
    },
  });
};
