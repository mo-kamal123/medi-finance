import { balanceSheetRoutes } from "./balance-sheet/routes/routes";
import { incomeStatementRoutes } from "./income-statement/routes/routes";
import { trialBalanceRoutes } from "./trial-balance/routes/routes";

export const financialStatementsRoutes = [
    ...trialBalanceRoutes,
    ...balanceSheetRoutes,
    ...incomeStatementRoutes,
]