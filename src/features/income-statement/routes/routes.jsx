import { lazyPage } from '../../../shared/lib/lazy-page';

export const incomeStatementRoutes = [
  {
    path: '/income-statement',
    element: lazyPage(
      () => import('../pages/income-statement-page'),
      '\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062F\u062E\u0644...'
    ),
  },
];
