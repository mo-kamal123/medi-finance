import { lazyPage } from '../../../../shared/lib/lazy-page';

export const accountsTreeRoutes = [
  {
    path: 'accounts-tree',
    element: lazyPage(
      () => import('../pages/AccountsTree'),
      'جاري تحميل شجرة الحسابات...'
    ),
  },
  {
    path: 'accounts-tree/:id',
    element: lazyPage(
      () => import('../pages/update-account'),
      'جاري تحميل الحساب...'
    ),
  },
  {
    path: 'accounts-tree/new',
    element: lazyPage(
      () => import('../pages/new-account'),
      'جاري تحميل نموذج الحساب...'
    ),
  },
];
