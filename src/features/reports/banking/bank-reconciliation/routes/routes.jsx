import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankReconciliationRoutes = [
  {
    path: '/bank-reconciliation',
    element: lazyPage(
      () => import('../pages/bank-reconciliation-page'),
      'جاري تحميل مطابقة البنوك...'
    ),
  },
];