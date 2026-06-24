import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAllInvoices,
  getBatchByNumber,
  getCustomers,
  getFinancialPeriods,
  getInvoiceById,
  getInvoiceStatuses,
  getInvoiceTypes,
  getNextInvoiceNumber,
  getProductsServices,
  getSuppliers,
} from '../api/invoices-api';
import { invoicesKeys } from './invoices.keys';

export const useInvoices = (filters, type) => {
  return useQuery({
    queryKey: invoicesKeys.list({ ...filters, type }),
    queryFn: () => getAllInvoices(filters, type),
    placeholderData: keepPreviousData,
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: invoicesKeys.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });
};

export const useBatch = (batchNumber, enabled = true) => {
  return useQuery({
    queryKey: invoicesKeys.batch(batchNumber),
    queryFn: () => getBatchByNumber(batchNumber),
    enabled: enabled && Boolean(batchNumber),
  });
};

export const useInvoiceTypes = () => {
  return useQuery({
    queryKey: invoicesKeys.types(),
    queryFn: getInvoiceTypes,
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: invoicesKeys.suppliers(),
    queryFn: getSuppliers,
  });
};

export const useCustomers = () => {
  return useQuery({
    queryKey: invoicesKeys.customers(),
    queryFn: getCustomers,
  });
};

export const useFinancialPeriods = () => {
  return useQuery({
    queryKey: invoicesKeys.financial(),
    queryFn: getFinancialPeriods,
  });
};

export const useProductsServices = () => {
  return useQuery({
    queryKey: invoicesKeys.services(),
    queryFn: getProductsServices,
  });
};

export const useNextInvoiceNumber = (enabled = true) => {
  return useQuery({
    queryKey: invoicesKeys.nextNumber(),
    queryFn: getNextInvoiceNumber,
    enabled,
  });
};

export const useInvoiceStatuses = () => {
  return useQuery({
    queryKey: invoicesKeys.statuses(),
    queryFn: getInvoiceStatuses,
  });
};
