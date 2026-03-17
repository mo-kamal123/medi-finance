import CommercialPapersPage from '../pages/commercial-papers-page';
import NewCommercialPaper from '../pages/new-commercial-paper';
import EditCommercialPaper from '../pages/edit-commercial-paper';

const CommercialPapersRoutes = [
  { path: '/commercial-papers', element: <CommercialPapersPage /> },
  { path: '/commercial-papers/new', element: <NewCommercialPaper /> },
  {
    path: '/commercial-papers/edit/:id',
    element: <EditCommercialPaper />,
  },
];

export default CommercialPapersRoutes;