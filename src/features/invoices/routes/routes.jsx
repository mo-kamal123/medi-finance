import EditInvoice from '../pages/edit-invoice';
import InvoicesPage from '../pages/invoices-page';
import NewSupplierInvoice from '../pages/new-customer-invoice';
import NewInvoice from '../pages/new-supplier-invoice';

const InvoicesRoutes = [
  { path: '/suppliers-invoices', element: <InvoicesPage /> },
  { path: '/customers-invoices', element: <InvoicesPage /> },
  { path: '/invoices/new', element: <NewSupplierInvoice /> },
  { path: '/invoices/:id', element: <EditInvoice /> },
];

export default InvoicesRoutes;
