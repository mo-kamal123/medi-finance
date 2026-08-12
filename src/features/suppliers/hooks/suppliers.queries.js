import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as api from '../api/suppliers.api';
import { suppliersKeys } from './suppliers.keys';

export const useSuppliers = (filters) =>
  useQuery({
    queryKey: ['suppliers', 'list', filters],
    queryFn: () => api.getSuppliers(filters),
    placeholderData: keepPreviousData,
  });

export const useSupplier = (id) =>
  useQuery({
    queryKey: suppliersKeys.detail(id),
    queryFn: () => api.getSupplier(id),
    enabled: !!id,
  });

export const useSupplierStatuses = () =>
  useQuery({
    queryKey: ['suppliers', 'statuses'],
    queryFn: api.getSupplierStatuses,
    staleTime: 5 * 60 * 1000,
  });

export const useProviderClasses = () =>
  useQuery({
    queryKey: ['suppliers', 'provider-classes'],
    queryFn: api.getProviderClasses,
    staleTime: 5 * 60 * 1000,
  });

export const useImportanceLevels = () =>
  useQuery({
    queryKey: ['suppliers', 'importance-levels'],
    queryFn: api.getImportanceLevels,
    staleTime: 5 * 60 * 1000,
  });

export const useGovernorates = () =>
  useQuery({
    queryKey: ['suppliers', 'governorates'],
    queryFn: api.getGovernorates,
    staleTime: 5 * 60 * 1000,
  });

export const useOperationTypes = () =>
  useQuery({
    queryKey: ['suppliers', 'operation-types'],
    queryFn: api.getOperationTypes,
    staleTime: 5 * 60 * 1000,
  });

export const useNetworks = () =>
  useQuery({
    queryKey: ['suppliers', 'networks'],
    queryFn: api.getNetworks,
    staleTime: 5 * 60 * 1000,
  });

export const usePrograms = () =>
  useQuery({
    queryKey: ['suppliers', 'programs'],
    queryFn: api.getPrograms,
    staleTime: 5 * 60 * 1000,
  });
