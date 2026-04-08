import { lazyPage } from '../../../../shared/lib/lazy-page';

const costCenterRoutes = [
  {
    path: 'cost-tree',
    element: lazyPage(
      () => import('../pages/cost-center-tree'),
      'جاري تحميل شجرة مراكز التكلفة...'
    ),
  },
  {
    path: 'cost-tree/:id',
    element: lazyPage(
      () => import('../pages/update-cost'),
      'جاري تحميل مركز التكلفة...'
    ),
  },
  {
    path: 'cost-tree/new',
    element: lazyPage(
      () => import('../pages/new-cost'),
      'جاري تحميل نموذج مركز التكلفة...'
    ),
  },
];

export default costCenterRoutes;
