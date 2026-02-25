import AccountsTree from '../pages/AccountsTree';
import NewAccount from '../pages/new-account';
import UpdateAccount from '../pages/update-account';

export const accountsTreeRoutes = [
  {
    path: 'accounts-tree',
    element: <AccountsTree />,
  },
  {
    path: 'accounts-tree/:id',
    element: <UpdateAccount />,
  },
  {
    path: 'accounts-tree/new',
    element: <NewAccount />,
  },
];
