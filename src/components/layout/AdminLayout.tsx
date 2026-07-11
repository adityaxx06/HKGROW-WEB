import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Users,
  CalendarDays,
  Newspaper,
  Inbox,
  MessageSquareQuote,
  ScrollText,
  Settings,
  LayoutTemplate,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useIdleReset } from '@/store/useIdleReset';

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Properties', to: '/admin/properties', icon: Building2 },
  { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
  { label: 'Team', to: '/admin/team', icon: Users },
  { label: 'Events', to: '/admin/events', icon: CalendarDays },
  { label: 'Blog', to: '/admin/blog', icon: Newspaper },
  { label: 'Leads', to: '/admin/leads', icon: Inbox },
  { label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquareQuote },
  { label: 'Legal Pages', to: '/admin/legal', icon: ScrollText },
  { label: 'Homepage Content', to: '/admin/settings/content', icon: LayoutTemplate },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

/**
 * Sidebar contents — shared between the permanent desktop sidebar and the
 * mobile slide-in drawer so nav items / styles never drift apart.
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
        <img src="/logo.png" alt="HK Grow Infra" className="h-9 w-9 rounded-md object-contain" />
        <span className="text-base font-bold text-navy-700">Admin Panel</span>
      </div>
      <nav className="space-y-1 p-3" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors',
                // py-3 (not py-2.5) gives a ~44px tap target on touch devices
                isActive ? 'bg-navy-50 text-navy-700' : 'text-ink-secondary hover:bg-gray-50 hover:text-ink-primary'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/** Shell for the /admin/* section: sidebar nav + top bar with sign-out. */
export function AdminLayout() {
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  useIdleReset();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer automatically whenever the route changes (e.g. after
  // tapping a nav link, or navigating via breadcrumb/back button).
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open so the page behind it
  // doesn't scroll on touch devices.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ── Desktop sidebar — unchanged, permanent, lg+ only ── */}
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer + overlay — lg:hidden ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="admin-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-navy-900/50 lg:hidden"
              aria-hidden="true"
            />
            {/* Drawer panel */}
            <motion.aside
              key="admin-drawer-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-label="Admin navigation menu"
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-card-hover lg:hidden"
            >
              <div className="flex items-center justify-end px-3 pt-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="rounded-md p-2.5 text-ink-secondary hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main column ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="-ml-1 shrink-0 rounded-md p-2.5 text-ink-secondary hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="min-w-0 truncate text-sm font-medium text-ink-secondary">
              <span className="hidden sm:inline">Signed in as </span>
              <span className="text-ink-primary">{user?.email}</span>
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="inline-flex shrink-0 items-center gap-2 rounded-md px-2.5 py-2.5 text-sm font-medium text-ink-secondary hover:bg-gray-50 hover:text-red-600 sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
