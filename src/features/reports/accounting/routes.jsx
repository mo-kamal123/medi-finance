import { agingReportRoutes } from "./aging-report/routes/routes";
import { generalLedgerRoutes } from "./general-ledger/routes/routes";

export const accountingReportsRoutes = [
    ...agingReportRoutes,
    ...generalLedgerRoutes,
]