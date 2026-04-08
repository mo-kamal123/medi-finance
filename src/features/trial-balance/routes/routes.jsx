import { lazyPage } from '../../../shared/lib/lazy-page';

export const trialBalanceRoutes = [
  {
    path: '/trial-balance',
    element: lazyPage(
      () => import('../pages/trial-balance-page'),
      'جاري تحميل ميزان المراجعة...'
    ),
  },
];
