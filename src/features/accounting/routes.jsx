import { accountsTreeRoutes } from "./tree/accouts-tree/routes/routes";
import costCenterRoutes from "./tree/cost-tree/routes/routes";
import { linkAccountCostRoutes } from "./tree/link-account-cost/routes/routes";


export const accountingRoutes = [
  ...accountsTreeRoutes,
  ...costCenterRoutes,
  ...linkAccountCostRoutes,
];
