import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/root-layout';
import AuthLayout from '../layouts/auth-layout';

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthLayout />, children: [] },
  { path: '/', element: <RootLayout />, children: [] },
]);
