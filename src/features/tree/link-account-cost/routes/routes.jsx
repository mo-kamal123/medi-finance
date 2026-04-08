import { lazyPage } from '../../../../shared/lib/lazy-page';

export const linkAccountCostRoutes = [
  {
    path: 'link',
    element: lazyPage(
      () => import('../pages/link-account-cost-center'),
      'جاري تحميل صفحة الربط...'
    ),
  },
];
