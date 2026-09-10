import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const cashFlowRoutes = [
  {
    path: '/cash-flow',
    element: lazyPage(
      () => import('../pages/cash-flow-page'),
      'جاري تحميل التدفقات النقدية...'
    ),
  },
];