import { lazyPage } from '../../../shared/lib/lazy-page';

export const customersRoutes = [
  {
    path: '/customers',
    element: lazyPage(
      () => import('../pages/customers-page'),
      'جاري تحميل العملاء...'
    ),
  },
  {
    path: '/customers/new',
    element: lazyPage(
      () => import('../pages/new-customer'),
      'جاري تحميل نموذج العميل...'
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
