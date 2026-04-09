import {
  useInvoiceTypes,
  useCustomers,
  useSuppliers,
  useFinancialPeriods,
  useProductsServices,
} from '../hooks/invoices.queries';
const useDropdowns = () => {
  const { data: invoiceTypes } = useInvoiceTypes();
  const { data: customers } = useCustomers();
  const { data: suppliers } = useSuppliers();
  const { data: financialPeriods } = useFinancialPeriods();
  const { data: productsServices } = useProductsServices();
  return {
    productsServices,
    invoiceTypes,
    customers,
    suppliers,
    financialPeriods,
  };
};

export default useDropdowns;
