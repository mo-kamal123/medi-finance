import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const bankStatementRoutes = [
  {
    path: '/bank-statement',
    element: lazyPage(
      () => import('../pages/bank-statement-page'),
      'جاري تحميل كشف حساب البنك...'
    ),
  },
];