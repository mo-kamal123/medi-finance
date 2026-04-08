import { lazyPage } from '../../../shared/lib/lazy-page';

export const entriesRoutes = [
  {
    path: '/entries',
    element: lazyPage(
      () => import('../pages/daily-entries'),
      'جاري تحميل القيود اليومية...'
    ),
  },
  {
    path: '/entries/new',
    element: lazyPage(
      () => import('../pages/new-daily-entry'),
      'جاري تحميل نموذج القيد...'
    ),
  },
  {
    path: '/entries/:id',
    element: lazyPage(
      () => import('../pages/view-entry'),
      'جاري تحميل القيد...'
    ),
  },
];
