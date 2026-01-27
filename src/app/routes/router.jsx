import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/root-layout';
import AuthLayout from '../layouts/auth-layout';
import { authRoutes } from '../../features/auth/routes/routes';

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthLayout />, children: [...authRoutes] },
  { path: '/', element: <RootLayout />, children: [] },
]);
