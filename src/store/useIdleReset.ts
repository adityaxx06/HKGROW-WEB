import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Mount this hook once inside AdminLayout to reset the 30-minute idle
 * timer on any meaningful user interaction (mouse, keyboard, touch).
 * Per section 7: idle session timeout is enforced in the admin UI.
 */
export function useIdleReset() {
  const resetIdleTimer = useAuthStore((s) => s.resetIdleTimer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

    const reset = () => resetIdleTimer();

    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isAuthenticated, resetIdleTimer]);
}
