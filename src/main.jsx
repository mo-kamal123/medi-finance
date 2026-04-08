import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './app/api/queryClient.js';
import { router } from './app/routes/router.jsx';
import { store } from './app/store/store.js';
import ToastProvider from './shared/components/toast-provider.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
