// Combined dropdown-data hook for the invoice form.

import {
  useInvoiceTypes,
  useFinancialPeriods,
  useProductsServices,
} from './invoices.queries';
const useDropdowns = () => {
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: financialPeriods } = useFinancialPeriods();
  const { data: productsServices } = useProductsServices();
  return {
    productsServices,
    invoiceTypes,
    financialPeriods,
  };
};

export default useDropdowns;
