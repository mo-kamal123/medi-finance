import { lazyPage } from '../../../shared/lib/lazy-page';

const CommercialPapersRoutes = [
  {
    path: '/commercial-papers',
    element: lazyPage(
      () => import('../pages/receivable-commercial-papers'),
      'جاري تحميل الأوراق التجارية...'
    ),
  },
  {
    path: '/commercial-papers/receivable',
    element: lazyPage(
      () => import('../pages/receivable-commercial-papers'),
      'جاري تحميل أوراق القبض...'
    ),
  },
  {
    path: '/commercial-papers/payable',
    element: lazyPage(
      () => import('../pages/payable-commercial-papers'),
      'جاري تحميل أوراق الدفع...'
    ),
  },
  {
    path: '/commercial-papers/receivable/new',
    element: lazyPage(
      () => import('../pages/new-receivable-commercial-paper'),
      'جاري تحميل نموذج ورقة القبض...'
    ),
  },
  {
    path: '/commercial-papers/payable/new',
    element: lazyPage(
      () => import('../pages/new-payable-commercial-paper'),
      'جاري تحميل نموذج ورقة الدفع...'
    ),
  },
  {
    path: '/commercial-papers/:id',
    element: lazyPage(
      () => import('../pages/edit-commercial-paper'),
      'جاري تحميل بيانات الورقة...'
    ),
  },
  {
    path: '/commercial-papers/edit/:id',
    element: lazyPage(
      () => import('../pages/edit-commercial-paper'),
      'جاري تحميل بيانات الورقة...'
    ),
  },
];

export default CommercialPapersRoutes;
