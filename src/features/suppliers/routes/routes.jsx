import { lazyPage } from '../../../shared/lib/lazy-page';

export const suppliersRoutes = [
  {
    path: '/suppliers',
    element: lazyPage(
      () => import('../pages/suppliers-page'),
      'جاري تحميل الموردين...'
    ),
  },
  {
    path: '/suppliers/new',
    element: lazyPage(
      () => import('../pages/supplier-create'),
      'جاري تحميل نموذج المورد...'
    ),
  },
  {
    path: '/suppliers/:id',
    element: lazyPage(
      () => import('../pages/supplier-details'),
      'جاري تحميل بيانات المورد...'
    ),
  },
];
