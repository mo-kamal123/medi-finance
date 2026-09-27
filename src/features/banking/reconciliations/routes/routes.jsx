import { lazyPage } from '../../../../shared/lib/lazy-page';

export const reconciliationsRoutes = [
  {
    path: '/reconciliations/new',
    element: lazyPage(
      () => import('../pages/new-reconciliation-page'),
      'جاري تحميل نموذج التسوية...'
    ),
  },
  {
    path: '/reconciliations',
    element: lazyPage(
      () => import('../pages/reconciliations-page'),
      'جاري تحميل التسويات...'
    ),
  },
  {
    path: '/reconciliations/:id',
    element: lazyPage(
      () => import('../pages/reconciliation-details-page'),
      'جاري تحميل تفاصيل التسوية...'
    ),
  },
];
