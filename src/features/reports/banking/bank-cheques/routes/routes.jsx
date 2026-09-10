import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankChequesRoutes = [
  {
    path: '/cheques-report',
    element: lazyPage(
      () => import('../pages/bank-cheques-report-page'),
      'جاري تحميل تقرير الشيكات...'
    ),
  },
];