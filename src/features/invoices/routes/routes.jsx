import { lazyPage } from '../../../shared/lib/lazy-page';

const InvoicesRoutes = [
  {
    path: '/suppliers-invoices',
    element: lazyPage(
      () => import('../pages/invoices-page'),
      'جاري تحميل الفواتير...'
    ),
  },
  {
    path: '/customers-invoices',
    element: lazyPage(
      () => import('../pages/invoices-page'),
      'جاري تحميل الفواتير...'
    ),
  },
  {
    path: '/invoices/new',
    element: lazyPage(
      () => import('../pages/new-customer-invoice'),
      'جاري تحميل نموذج الفاتورة...'
    ),
  },
  {
    path: '/invoices/edit/:id',
    element: lazyPage(
      () => import('../pages/edit-invoice'),
      'جاري تحميل الفاتورة...'
    ),
  },
  {
    path: '/invoices/:id',
    element: lazyPage(
      () => import('../pages/edit-invoice'),
      'جاري تحميل الفاتورة...'
    ),
  },
];

export default InvoicesRoutes;
