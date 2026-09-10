import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankTransactionsRoutes = [
  {
    path: '/bank-transactions',
    element: lazyPage(
      () => import('../pages/bank-transactions-report-page'),
      'جاري تحميل حركات البنوك...'
    ),
  },
];