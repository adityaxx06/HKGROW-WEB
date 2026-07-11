import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Route guard for /admin/*. Redirects unauthenticated users to /admin/login,
 * preserving the originally requested path so login can redirect back.
 *
 * While the initial session check is in flight, renders nothing (a blank
 * frame) rather than flashing the login page for authenticated users.
 */
export function AdminGuard() {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-secondary">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
