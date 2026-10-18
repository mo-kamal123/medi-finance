import { customersRoutes } from "./customers/routes/routes";
import { suppliersRoutes } from "./suppliers/routes/routes";
import { batchesRoutes } from './batches/routes';

export const masterDataRoutes = [
    ...customersRoutes,
    ...suppliersRoutes,
    ...batchesRoutes,
]
