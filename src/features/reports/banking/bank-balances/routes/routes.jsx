import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankBalancesRoutes = [
  {
    path: '/bank-balances',
    element: lazyPage(
      () => import('../pages/bank-balances-page'),
      'جاري تحميل أرصدة البنوك...'
    ),
  },
];