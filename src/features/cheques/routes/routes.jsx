import { lazyPage } from '../../../shared/lib/lazy-page';

const chequesRoutes = [
  {
    path: '/cheques',
    element: lazyPage(
      () => import('../pages/cheques-page'),
      'جاري تحميل الشيكات...'
    ),
  },
  {
    path: '/cheques/new',
    element: lazyPage(
      () => import('../pages/new-cheque'),
      'جاري تحميل نموذج الشيك...'
    ),
  },
  {
    path: '/cheques/:id',
    element: lazyPage(
      () => import('../pages/cheque-details'),
      'جاري تحميل بيانات الشيك...'
    ),
  },
];

export default chequesRoutes;
