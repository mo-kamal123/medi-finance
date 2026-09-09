// Invoice route definitions (lazy-loaded).

import { lazyPage } from '../../../../../shared/lib/lazy-page';

const InvoicesRoutes = [
  {
    path: '/suppliers-invoices',
    element: lazyPage(
      () => import('../../suppliers-invoices/invoices-page'),
      'جاري تحميل الفواتير...'
    ),
  },
  {
    path: '/customers-invoices',
    element: lazyPage(
      () => import('../../customers-invoices/invoices-page'),
      'جاري تحميل الفواتير...'
    ),
  },
  {
    path: '/batches-invoices',
    element: lazyPage(
      () => import('../../batch-invoices/batch-invoices-page'),
      'جاري تحميل فواتير المطالبات...'
    ),
  },
  {
    path: '/customers-invoices/new',
    element: lazyPage(
      () => import('../../customers-invoices/new-invoice'),
      'جاري تحميل نموذج الفاتورة...'
    ),
  },
  {
    path: '/suppliers-invoices/new',
    element: lazyPage(
      () => import('../../suppliers-invoices/new-invoice'),
      'جاري تحميل نموذج الفاتورة...'
    ),
  },
  {
    path: '/batches-invoices/new',
    element: lazyPage(
      () => import('../../batch-invoices/new-batch-invoice'),
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
