import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes — per section 7

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Resets the idle timer. Call on any meaningful user interaction in admin. */
  resetIdleTimer: () => void;
  init: () => void;
}

let idleTimer: ReturnType<typeof setTimeout> | null = null;

function clearIdleTimer() {
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function startIdleTimer(signOut: () => Promise<void>) {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    void signOut();
  }, IDLE_TIMEOUT_MS);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isInitializing: true,
  isAuthenticated: false,

  init: () => {
    supabase.auth.getSession().then(({ data }) => {
      const hasSession = !!data.session;
      set({
        session: data.session,
        user: data.session?.user ?? null,
        isAuthenticated: hasSession,
        isInitializing: false,
      });
      if (hasSession) {
        startIdleTimer(get().signOut);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const hasSession = !!session;
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: hasSession,
        isInitializing: false,
      });
      if (hasSession) {
        startIdleTimer(get().signOut);
      } else {
        clearIdleTimer();
      }
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: error.message };
    }

    set({
      session: data.session,
      user: data.user,
      isAuthenticated: !!data.session,
      isInitializing: false,
    });

    startIdleTimer(get().signOut);
    return { error: null };
  },

  signOut: async () => {
    clearIdleTimer();
    await supabase.auth.signOut();
    set({ session: null, user: null, isAuthenticated: false });
  },

  resetIdleTimer: () => {
    if (get().isAuthenticated) {
      startIdleTimer(get().signOut);
    }
  },
}));
