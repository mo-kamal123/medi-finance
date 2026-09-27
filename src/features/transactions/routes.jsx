import { cashTransactionsRoutes } from "./cash-transactions/routes/routes";
import cashVouchersRoutes from "./cash-vouchers/routes/routes";
import CommercialPapersRoutes from "./commercial-papers/routes/routes";
import { entriesRoutes } from "./entries/routes/routes";
import InvoicesRoutes from "./invoices/shared/routes/routes";

export const transactionsRoutes = [
    ...InvoicesRoutes,
    ...entriesRoutes,
    ...cashTransactionsRoutes,
    ...cashVouchersRoutes,
    ...CommercialPapersRoutes,
]