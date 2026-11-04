import { accountingReportsRoutes } from "./accounting/routes";
import { bankingReportsRoutes } from "./banking/routes";
import { financialStatementsRoutes } from "./financial-statements/routes";
import { lazyPage } from '../../shared/lib/lazy-page';

export const reportsRoutes = [
    ...accountingReportsRoutes,
    ...financialStatementsRoutes,
    ...bankingReportsRoutes,
    {
      path: '/consumption-report',
      element: lazyPage(
        () => import('./consumption/pages/consumption-report-page'),
        'جاري تحميل تقرير الاستهلاكات...'
      ),
    },
];
