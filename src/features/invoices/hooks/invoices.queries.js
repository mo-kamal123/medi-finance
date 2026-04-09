import { useQuery } from '@tanstack/react-query';
import {
  getAllInvoices,
  getCustomers,
  getFinancialPeriods,
  getInvoiceById,
  getInvoiceTypes,
  getNextInvoiceNumber,
  getProductsServices,
  getSuppliers,
} from '../api/invoices-api';
import { invoicesKeys } from './invoices.keys';

export const useInvoices = (filters, type) => {
  return useQuery({
    queryKey: invoicesKeys.lists({ ...filters, type }),
    queryFn: () => getAllInvoices(filters, type),
    keepPreviousData: true,
  });
};

export const useInvoice = (id) => {
  return useQuery({
    queryKey: invoicesKeys.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
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
