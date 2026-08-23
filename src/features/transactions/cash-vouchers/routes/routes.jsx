import { lazyPage } from '../../../../shared/lib/lazy-page';

const cashVouchersRoutes = [
  {
    path: '/cash-vouchers',
    element: lazyPage(
      () => import('../pages/cash-vouchers-page'),
      'جاري تحميل سندات القبض والدفع...'
    ),
  },
  {
    path: '/cash-vouchers/new',
    element: lazyPage(
      () => import('../pages/new-cash-voucher'),
      'جاري تحميل نموذج السند...'
    ),
  },
  {
    path: '/cash-vouchers/:id',
    element: lazyPage(
      () => import('../pages/cash-voucher-details'),
      'جاري تحميل بيانات السند...'
    ),
  },
];

export default cashVouchersRoutes;
