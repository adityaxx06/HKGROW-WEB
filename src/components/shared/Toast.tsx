/**
 * Minimal toast notification system.
 *
 * Architecture: a Zustand store holds the queue; <ToastContainer /> renders
 * it fixed bottom-right. Call `useToast()` from any component to push.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Property saved.');
 *   toast.error('Failed to save.');
 */

import { create } from 'zustand';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (message: string, tone: ToastTone) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, tone) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    // Auto-dismiss after 4 s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Hook to push toasts from any component. */
export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    success: (message: string) => push(message, 'success'),
    error:   (message: string) => push(message, 'error'),
    info:    (message: string) => push(message, 'info'),
  };
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error:   'border-red-200 bg-red-50 text-red-800',
  info:    'border-navy-200 bg-navy-50 text-navy-800',
};

const TONE_ICON: Record<ToastTone, typeof CheckCircle> = {
  success: CheckCircle,
  error:   XCircle,
  info:    AlertCircle,
};

/** Mount once inside App.tsx (or AdminLayout) to render the toast queue. */
export function ToastContainer() {
  const toasts  = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = TONE_ICON[t.tone];
        return (
          <div
            key={t.id}
            role="alert"
            className={clsx(
              'flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-card-hover',
              TONE_STYLES[t.tone]
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="rounded p-0.5 opacity-60 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
