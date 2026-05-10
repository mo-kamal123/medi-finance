import { lazyPage } from '../../../shared/lib/lazy-page';

export const agingReportRoutes = [
  {
    path: '/aging-report',
    element: lazyPage(
      () => import('../pages/aging-report-page'),
      'جاري تحميل تقرير أعمار الذمم...'
    ),
  },
];
