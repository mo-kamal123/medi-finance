import CostCenterTree from '../pages/cost-center-tree';
import NewCost from '../pages/new-cost';
import UpdateCost from '../pages/update-cost';

const costCenterRoutes = [{ path: 'cost-tree', element: <CostCenterTree /> },
{path: 'cost-tree/:id', element: <UpdateCost />},
{path: 'cost-tree/new', element: <NewCost />},
];

export default costCenterRoutes;
