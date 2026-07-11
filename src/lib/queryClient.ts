import { QueryClient } from '@tanstack/react-query';
import { isAuthError } from '@/utils/errors';

/**
 * Shared TanStack Query client.
 *
 * onError strategy:
 *   - Auth errors (JWT expired / 42501) trigger sign-out via the auth store.
 *     We import lazily to avoid a circular dependency
 *     (authStore → supabase → queryClient → authStore).
 *   - All other errors are handled at the hook/component level via the
 *     QueryBoundary component or mutation onError callbacks.
 *
 * staleTime defaults are conservative for a low-traffic Free-tier project.
 * Per-query overrides are set in individual hooks via the STALE constants.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            5 * 60 * 1000,  // 5 minutes
      gcTime:               30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry auth errors — sign out instead
        if (isAuthError(error)) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});

/**
 * Called once from App.tsx after the auth store is initialised.
 * Wires up the global query error handler for session expiry.
 */
export function setupQueryClientErrorHandler() {
  queryClient.getQueryCache().config.onError = (error) => {
    if (isAuthError(error)) {
      // Lazy import to avoid circular dependency
      import('@/store/authStore').then(({ useAuthStore }) => {
        void useAuthStore.getState().signOut();
      });
    }
  };
}
