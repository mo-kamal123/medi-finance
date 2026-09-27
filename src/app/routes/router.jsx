import { createBrowserRouter } from 'react-router-dom';
import { lazyPage } from '../../shared/lib/lazy-page';
import { authRoutes } from '../../features/auth/routes/routes';
import { accountingRoutes } from '../../features/accounting/routes';
import { bankingRoutes } from '../../features/banking/routes';
import { masterDataRoutes } from '../../features/master-data/routes';
import { transactionsRoutes } from '../../features/transactions/routes';
import { reportsRoutes } from '../../features/reports/routes';

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
      // accounting routes
      ...accountingRoutes,

      // banking routes
      ...bankingRoutes,

      // master data routes
      ...masterDataRoutes,

      // transactions routes
      ...transactionsRoutes,

      // reports routes
      ...reportsRoutes
     
    ],
  },
]);

