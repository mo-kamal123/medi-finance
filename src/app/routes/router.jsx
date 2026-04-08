import { createBrowserRouter } from 'react-router-dom';
import { authRoutes } from '../../features/auth/routes/routes';
import { banksRoutes } from '../../features/banks/routes/routes';
import chequesRoutes from '../../features/cheques/routes/routes';
import CommercialPapersRoutes from '../../features/commercial-papers/routes/routes';
import { customersRoutes } from '../../features/customers/routes/routes';
import { entriesRoutes } from '../../features/entries/routes/routes';
import { generalLedgerRoutes } from '../../features/general-ledger/routes/routes';
import InvoicesRoutes from '../../features/invoices/routes/routes';
import { suppliersRoutes } from '../../features/suppliers/routes/routes';
import { accountsTreeRoutes } from '../../features/tree/accouts-tree/routes/routes';
import costCenterRoutes from '../../features/tree/cost-tree/routes/routes';
import { linkAccountCostRoutes } from '../../features/tree/link-account-cost/routes/routes';
import { trialBalanceRoutes } from '../../features/trial-balance/routes/routes';
import { lazyPage } from '../../shared/lib/lazy-page';

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: lazyPage(
      () => import('../layouts/auth-layout'),
      'جاري تحميل صفحة تسجيل الدخول...'
    ),
    children: [...authRoutes],
  },
  {
    path: '/',
    element: lazyPage(
      () => import('../layouts/root-layout'),
      'جاري تحميل التطبيق...'
    ),
    children: [
      {
        index: true,
        element: lazyPage(
          () => import('../../features/home/pages/home'),
          'جاري تحميل الصفحة الرئيسية...'
        ),
      },
      ...accountsTreeRoutes,
      ...costCenterRoutes,
      ...linkAccountCostRoutes,
      ...InvoicesRoutes,
      ...entriesRoutes,
      ...generalLedgerRoutes,
      ...trialBalanceRoutes,
      ...customersRoutes,
      ...suppliersRoutes,
      ...CommercialPapersRoutes,
      ...chequesRoutes,
      ...banksRoutes,
    ],
  },
]);
