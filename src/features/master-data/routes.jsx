import { customersRoutes } from "./customers/routes/routes";
import { suppliersRoutes } from "./suppliers/routes/routes";

export const masterDataRoutes = [
    ...customersRoutes,
    ...suppliersRoutes,
]