import { lazyPage } from '../../../shared/lib/lazy-page';

export const generalLedgerRoutes = [
  {
    path: '/general-ledger',
    element: lazyPage(
      () => import('../pages/general-ledger-page'),
      'جاري تحميل الأستاذ العام...'
    ),
  },
];
