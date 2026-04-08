import { lazyPage } from '../../../shared/lib/lazy-page';

export const balanceSheetRoutes = [
  {
    path: '/balance-sheet',
    element: lazyPage(
      () => import('../pages/balance-sheet-page'),
      '\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u064a\u0632\u0627\u0646\u064a\u0629 \u0627\u0644\u0639\u0645\u0648\u0645\u064a\u0629...'
    ),
  },
];
