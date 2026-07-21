import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAgingReport,
  getProviderClasses,
  getImportanceLevels,
  getSupplierStatuses,
  getCustomerCategories,
  getCustomerStatuses,
} from '../api/aging-report.api';
import { agingReportKeys } from './aging-report.keys';

export const useAgingReport = (filters) => {
  return useQuery({
    queryKey: agingReportKeys.list(filters),
    queryFn: () => getAgingReport(filters),
    placeholderData: keepPreviousData,
  });
};

export const useProviderClasses = () => {
  return useQuery({
    queryKey: ['lookups', 'provider-classes'],
    queryFn: getProviderClasses,
  });
};

export const useImportanceLevels = () => {
  return useQuery({
    queryKey: ['lookups', 'importance-levels'],
    queryFn: getImportanceLevels,
  });
};

export const useSupplierStatuses = () => {
  return useQuery({
    queryKey: ['lookups', 'supplier-statuses'],
    queryFn: getSupplierStatuses,
  });
};

export const useCustomerCategories = () => {
  return useQuery({
    queryKey: ['lookups', 'customer-categories'],
    queryFn: getCustomerCategories,
  });
};

export const useCustomerStatuses = () => {
  return useQuery({
    queryKey: ['lookups', 'customer-statuses'],
    queryFn: getCustomerStatuses,
  });
};
