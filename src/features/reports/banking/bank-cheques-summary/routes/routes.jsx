import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankChequesSummaryRoutes = [
  {
    path: '/cheques-summary',
    element: lazyPage(
      () => import('../pages/bank-cheques-summary-page'),
      'جاري تحميل ملخص الشيكات...'
    ),
  },
];