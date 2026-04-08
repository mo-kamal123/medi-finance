import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/suppliers.api';

export const useSuppliers = () =>
  useQuery({
    queryKey: ['suppliers'],
    queryFn: () => api.getSuppliers().then((res) => res.data),
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
    onSuccess: () => qc.invalidateQueries(['suppliers']),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.updateSupplier(id, data),
    onSuccess: () => qc.invalidateQueries(['suppliers']),
  });
};
