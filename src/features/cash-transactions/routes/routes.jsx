import { lazyPage } from '../../../shared/lib/lazy-page';

export const cashTransactionsRoutes = [
  {
    path: '/cash-transactions',
    element: lazyPage(
      () => import('../pages/cash-transactions-page'),
      'جاري تحميل الحركات النقدية...'
    ),
  },
  {
    path: '/cash-transactions/new',
    element: lazyPage(
      () => import('../pages/new-cash-transaction'),
      'جاري تحميل نموذج الحركة النقدية...'
    ),
  },
  {
    path: '/cash-transactions/:id',
    element: lazyPage(
      () => import('../pages/edit-cash-transaction'),
      'جاري تحميل بيانات الحركة النقدية...'
    ),
  },
];
