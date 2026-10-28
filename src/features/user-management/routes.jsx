import { lazyPage } from '../../shared/lib/lazy-page';

export const userManagementRoutes = [
  {
    path: '/users',
    element: lazyPage(
      () => import('./pages/users-page'),
      'جاري تحميل المستخدمين...'
    ),
  },
  {
    path: '/roles',
    element: lazyPage(
      () => import('./pages/roles-page'),
      'جاري تحميل الأدوار...'
    ),
  },
];
