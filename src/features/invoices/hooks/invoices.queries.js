import { useQuery } from '@tanstack/react-query';
import {
  getAllInvoices,
  getInvoiceById,
  getInvoiceTypes,
  getSuppliers,
  getCustomers,
  getFinancialPeriods,
} from '../api/invoices-api';
import { invoicesKeys } from './invoices.keys';

/* ===========================
   GET ALL INVOICES
=========================== */

export const useInvoices = (filters) => {
  return useQuery({
    queryKey: invoicesKeys.lists(filters),
    queryFn: () => getAllInvoices(filters),
    keepPreviousData: true,
  });
};

/* ===========================
   GET INVOICE BY ID
=========================== */
export const useInvoice = (id) => {
  return useQuery({
    queryKey: invoicesKeys.detail(id),
    queryFn: () => getInvoiceById(id),
    // enabled: !!id,
  });
};

/* ===========================
   GET TYPES
=========================== */
export const useInvoiceTypes = () => {
  return useQuery({
    queryKey: invoicesKeys.types(),
    queryFn: getInvoiceTypes,
  });
};

/* ===========================
   GET SUPPLIERS
=========================== */
export const useSuppliers = () => {
  return useQuery({
    queryKey: invoicesKeys.suppliers(),
    queryFn: getSuppliers,
  });
};

/* ===========================
   GET CUSTOMERS
=========================== */
export const useCustomers = () => {
  return useQuery({
    queryKey: invoicesKeys.customers(),
    queryFn: getCustomers,
  });
};

/* ===========================
   GET financial-periods
=========================== */
export const useFinancialPeriods = () => {
  return useQuery({
    queryKey: invoicesKeys.financial(),
    queryFn: getFinancialPeriods,
  });
};
