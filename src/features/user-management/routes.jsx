import { lazyPage } from '../../shared/lib/lazy-page';

export const userManagementRoutes = [
  {
    path: '/users/:id',
    element: lazyPage(
      () => import('./pages/edit-user-page'),
      'جاري تحميل بيانات المستخدم...'
    ),
  },
  {
    path: '/users/new',
    element: lazyPage(
      () => import('./pages/new-user-page'),
      'جاري تحميل نموذج المستخدم...'
    ),
  },
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
