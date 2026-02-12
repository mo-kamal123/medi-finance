import DailyEntriesPage from "../pages/daily-entries";
import InvoicesPage from "../pages/invoices-page";
import NewDailyEntryPage from "../pages/new-daily-entry";
import NewInvoice from "../pages/new-invoice";


const InvoicesRoutes = [
    {path: '/invoices', element: <InvoicesPage />},
    {path: '/invoices/new', element: <NewInvoice />},
    {path: '/entries', element: <DailyEntriesPage />},
    {path: '/entries/new', element: <NewDailyEntryPage />},
]

export default InvoicesRoutes;