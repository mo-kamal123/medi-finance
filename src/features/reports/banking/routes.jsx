import { bankBalancesRoutes } from "./bank-balances/routes/routes";
import { bankChequesRoutes } from "./bank-cheques/routes/routes";
import { bankReconciliationRoutes } from "./bank-reconciliation/routes/routes";
import { bankStatementRoutes } from "./bank-statement/routes/routes";
import { bankTransactionsRoutes } from "./bank-transactions/routes/routes";
import { bankTransfersRoutes } from "./bank-transfers/routes/routes";
import { cashFlowRoutes } from "./cash-flow/routes/routes";
import { outstandingChequesRoutes } from "./outstanding-cheques/routes/routes";

export const bankingReportsRoutes = [
    ...bankStatementRoutes,
    ...bankTransactionsRoutes,
    ...bankBalancesRoutes,
    ...bankReconciliationRoutes,
    ...bankTransfersRoutes,
    ...bankChequesRoutes,
    ...outstandingChequesRoutes,
    ...cashFlowRoutes,

]