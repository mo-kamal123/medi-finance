import { banksRoutes } from "./banks/routes/routes";
import chequesRoutes from "./cheques/routes/routes";
import { reconciliationsRoutes } from "./reconciliations/routes/routes";

export const bankingRoutes = [
    ...chequesRoutes,
    ...banksRoutes,
    ...reconciliationsRoutes,
]