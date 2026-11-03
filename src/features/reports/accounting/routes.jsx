import { agingReportRoutes } from "./aging-report/routes/routes";
import { generalLedgerRoutes } from "./general-ledger/routes/routes";
import { lazyPage } from '../../../shared/lib/lazy-page';

export const accountingReportsRoutes = [
    ...agingReportRoutes,
    ...generalLedgerRoutes,
    {
      path: '/mediconsult-payables',
      element: lazyPage(
        () => import('./mediconsult-payables/pages/mediconsult-payables-page'),
        'جاري تحميل تقرير ذمم MEDICONSULT...'
      ),
    },
]
