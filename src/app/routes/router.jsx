import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/root-layout';
import AuthLayout from '../layouts/auth-layout';
import { authRoutes } from '../../features/auth/routes/routes';
import Home from '../../features/home/pages/home';

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthLayout />, children: [...authRoutes] },
  {
    path: '/',
    element: <RootLayout />,
    children: [{ index: true, element: <Home /> }],
  },
]);
