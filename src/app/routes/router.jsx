import { createBrowserRouter } from 'react-router-dom';
import { authRoutes } from '../../features/auth/routes/routes';
import { agingReportRoutes } from '../../features/reports/accounting/aging-report/routes/routes';
import { balanceSheetRoutes } from '../../features/reports/financial-statements/balance-sheet/routes/routes';
import { incomeStatementRoutes } from '../../features/reports/financial-statements/income-statement/routes/routes';
import { banksRoutes } from '../../features/banking/banks/routes/routes';
import { cashTransactionsRoutes } from '../../features/transactions/cash-transactions/routes/routes';
import chequesRoutes from '../../features/banking/cheques/routes/routes';
import CommercialPapersRoutes from '../../features/transactions/commercial-papers/routes/routes';
import cashVouchersRoutes from '../../features/transactions/cash-vouchers/routes/routes';
import { customersRoutes } from '../../features/master-data/customers/routes/routes';
import { entriesRoutes } from '../../features/transactions/entries/routes/routes';
import { generalLedgerRoutes } from '../../features/reports/accounting/general-ledger/routes/routes';
import InvoicesRoutes from '../../features/transactions/invoices/routes/routes';
import { suppliersRoutes } from '../../features/master-data/suppliers/routes/routes';
import { accountsTreeRoutes } from '../../features/accounting/tree/accouts-tree/routes/routes';
import costCenterRoutes from '../../features/accounting/tree/cost-tree/routes/routes';
import { linkAccountCostRoutes } from '../../features/accounting/tree/link-account-cost/routes/routes';
import { trialBalanceRoutes } from '../../features/reports/financial-statements/trial-balance/routes/routes';
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
          () => import('../../features/dashboard/pages/home'),
          'جاري تحميل الصفحة الرئيسية...'
        ),
      },
      ...accountsTreeRoutes,
      ...costCenterRoutes,
      ...linkAccountCostRoutes,
      ...agingReportRoutes,
      ...InvoicesRoutes,
      ...entriesRoutes,
      ...cashTransactionsRoutes,
      ...cashVouchersRoutes,
      ...generalLedgerRoutes,
      ...trialBalanceRoutes,
      ...balanceSheetRoutes,
      ...incomeStatementRoutes,
      ...customersRoutes,
      ...suppliersRoutes,
      ...CommercialPapersRoutes,
      ...chequesRoutes,
      ...banksRoutes,
    ],
  },
]);

