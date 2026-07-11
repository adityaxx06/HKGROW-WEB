import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { supabase } from '@/lib/supabase';
import type { WebsiteSettings } from '@/types/database';

const NAV_LINKS = [
  { label: 'Home',       to: '/' },
  { label: 'Properties', to: '/properties' },
  { label: 'Projects',   to: '/projects' },
  { label: 'About',      to: '/about' },
  { label: 'Events',     to: '/events' },
  { label: 'Blog',       to: '/blog' },
  { label: 'Contact',    to: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['website_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 'singleton')
        .single();
      if (error) throw error;
      return data as WebsiteSettings;
    },
  });

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300',
        scrolled ? 'border-gray-200 shadow-md' : 'border-transparent',
      )}
    >
      <nav className="container-page flex h-20 items-center justify-between" aria-label="Main navigation">
        <NavLink to="/" className="flex items-center gap-3 font-display text-lg font-medium text-navy-800">
          <img src="/logo.png" alt="HK Grow Infra" className="h-10 w-10 rounded-sm object-contain" />
          <span className="hidden sm:inline">Grow Infra</span>
        </NavLink>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    'relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300',
                    isActive ? 'text-navy-800' : 'text-ink-secondary hover:text-navy-800',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-px bg-gold-600" aria-hidden="true" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-5 lg:flex">
          {settings?.phone_primary && (
            <a
              href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-gold-700 transition-colors duration-300"
            >
              <Phone className="h-4 w-4" />
              {settings.phone_primary}
            </a>
          )}
          <NavLink
            to="/contact"
            className="inline-flex items-center gap-1.5 rounded-sm bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-navy-900"
          >
            <MessageCircle className="h-4 w-4" />
            Get in Touch
          </NavLink>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-sm p-2 text-navy-700 lg:hidden"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu — animated */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-gray-100 bg-white lg:hidden"
          >
            <ul className="container-page flex flex-col py-2">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'block rounded-md px-3 py-2.5 text-base font-medium',
                        isActive ? 'bg-navy-50 text-navy-600' : 'text-ink-primary hover:bg-gray-50',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.li>
              ))}
              {settings?.phone_primary && (
                <li className="mt-2 border-t border-gray-100 pt-2">
                  <a
                    href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 px-3 py-2.5 text-base font-semibold text-navy-700"
                  >
                    <Phone className="h-4 w-4" />
                    {settings.phone_primary}
                  </a>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
