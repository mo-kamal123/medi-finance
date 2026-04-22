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
    path: '/batches-invoices',
    element: lazyPage(
      () => import('../pages/batch-invoices-page'),
      'جاري تحميل فواتير المطالبات...'
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
    path: '/batches-invoices/new',
    element: lazyPage(
      () => import('../pages/new-batch-invoice'),
      'جاري تحميل نموذج فاتورة المطالبة...'
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
