import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankTransfersRoutes = [
  {
    path: '/bank-transfers',
    element: lazyPage(
      () => import('../pages/bank-transfers-report-page'),
      'جاري تحميل التحويلات البنكية...'
    ),
  },
];