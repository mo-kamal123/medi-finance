import { lazyPage } from '../../../../../shared/lib/lazy-page';

export const generalLedgerRoutes = [
  {
    path: '/general-ledger',
    element: lazyPage(
      () => import('../pages/general-ledger-page'),
      'جاري تحميل الأستاذ العام...'
    ),
  },
  {
    path: '/general-ledger/supplier',
    element: lazyPage(
      () => import('../pages/supplier-account-statement'),
      'جاري تحميل كشف حساب المورد...'
    ),
  },
  {
    path: '/general-ledger/customer',
    element: lazyPage(
      () => import('../pages/customer-account-statement'),
      'جاري تحميل كشف حساب العميل...'
    ),
  },
];
