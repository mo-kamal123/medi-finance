import { lazyPage } from '../../../shared/lib/lazy-page';

export const authRoutes = [
  {
    index: true,
    element: lazyPage(
      () => import('../pages/login'),
      'جاري تحميل صفحة تسجيل الدخول...'
    ),
  },
];
