import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient, setupQueryClientErrorHandler } from '@/lib/queryClient';
import { router } from '@/router';
import { useAuthStore } from '@/store/authStore';
import { ToastContainer } from '@/components/shared/Toast';

export function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
    setupQueryClientErrorHandler();
  }, [init]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
      </QueryClientProvider>
    </HelmetProvider>
  );
}
