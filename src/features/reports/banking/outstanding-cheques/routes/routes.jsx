import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const outstandingChequesRoutes = [
  {
    path: '/outstanding-cheques',
    element: lazyPage(
      () => import('../pages/outstanding-cheques-page'),
      'جاري تحميل الشيكات المعلقة...'
    ),
  },
];