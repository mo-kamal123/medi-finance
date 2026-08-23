import { lazyPage } from '../../../../shared/lib/lazy-page';

export const customersRoutes = [
  {
    path: '/customers',
    element: lazyPage(
      () => import('../pages/customers-page'),
      'جاري تحميل العملاء...'
    ),
  },
  {
    path: '/customers/:id',
    element: lazyPage(
      () => import('../pages/customer-details'),
      'جاري تحميل بيانات العميل...'
    ),
  },
];
