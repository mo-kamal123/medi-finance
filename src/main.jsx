import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes/router.jsx';
import { store } from './app/store/store.js';
import App from './app/App.jsx';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/api/queryClient.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}>
          <App />
        </RouterProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
