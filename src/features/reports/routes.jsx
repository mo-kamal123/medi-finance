import { accountingReportsRoutes } from "./accounting/routes";
import { bankingReportsRoutes } from "./banking/routes";
import { financialStatementsRoutes } from "./financial-statements/routes";

export const reportsRoutes = [
    ...accountingReportsRoutes,
    ...financialStatementsRoutes,
    ...bankingReportsRoutes
] 