import { lazyPage } from '../../../shared/lib/lazy-page';

export const banksRoutes = [
  {
    path: '/banks',
    element: lazyPage(
      () => import('../pages/banks-page'),
      'جاري تحميل البنوك...'
    ),
  },
  {
    path: '/banks/new',
    element: lazyPage(
      () => import('../pages/new-bank'),
      'جاري تحميل نموذج البنك...'
    ),
  },
  {
    path: '/banks/:id',
    element: lazyPage(
      () => import('../pages/bank-details'),
      'جاري تحميل بيانات البنك...'
    ),
  },
];
