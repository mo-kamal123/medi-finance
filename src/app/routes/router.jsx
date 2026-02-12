import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/root-layout';
import AuthLayout from '../layouts/auth-layout';
import { authRoutes } from '../../features/auth/routes/routes';
import Home from '../../features/home/pages/home';
import { accountsTreeRoutes } from '../../features/tree/accouts-tree/routes/routes';
import costCenterRoutes from '../../features/tree/cost-tree/routes/routes';
import InvoicesRoutes from '../../features/invoices/routes/routes';

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthLayout />, children: [...authRoutes] },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      ...accountsTreeRoutes,
      ...costCenterRoutes,
      ... InvoicesRoutes
    ],
  },
]);
