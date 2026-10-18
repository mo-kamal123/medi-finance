import { lazyPage } from '../../../shared/lib/lazy-page';

export const batchesRoutes = [
  {
    path: '/batches',
    element: lazyPage(() => import('./pages/batches-page'), 'جاري تحميل الدفعات...'),
  },
  {
    path: '/batches/:batchNumber',
    element: lazyPage(() => import('./pages/batch-details-page'), 'جاري تحميل بيانات الدفعة...'),
  },
];
