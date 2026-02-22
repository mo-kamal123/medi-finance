import InvoicesPage from "../pages/invoices-page";
import NewInvoice from "../pages/new-invoice";


const InvoicesRoutes = [
    {path: '/invoices', element: <InvoicesPage />},
    {path: '/invoices/new', element: <NewInvoice />},
    {path: '/invoices/:id', element: <NewInvoice />},
]

export default InvoicesRoutes;