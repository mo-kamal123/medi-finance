import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/root-layout';
import AuthLayout from '../layouts/auth-layout';
import { authRoutes } from '../../features/auth/routes/routes';
import Home from '../../features/home/pages/home';
import { accountsTreeRoutes } from '../../features/tree/accouts-tree/routes/routes';
import costCenterRoutes from '../../features/tree/cost-tree/routes/routes';
import InvoicesRoutes from '../../features/invoices/routes/routes';
import { entriesRoutes } from '../../features/entries/routes/routes';
import { linkAccountCostRoutes } from '../../features/tree/link-account-cost/routes/routes';
import { generalLedgerRoutes } from '../../features/general-ledger/routes/routes';
import { trialBalanceRoutes } from '../../features/trial-balance/routes/routes';
import { customersRoutes } from '../../features/customers/routes/routes';
import { suppliersRoutes } from '../../features/suppliers/routes/routes';
import CommercialPapersRoutes from '../../features/commercial-papers/routes/routes';

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthLayout />, children: [...authRoutes] },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      ...accountsTreeRoutes,
      ...costCenterRoutes,
      ...linkAccountCostRoutes,
      ...InvoicesRoutes,
      ...entriesRoutes,
      ...generalLedgerRoutes,
      ...trialBalanceRoutes,
      ...customersRoutes,
      ...suppliersRoutes,
      ...CommercialPapersRoutes
    ],
  },
]);
