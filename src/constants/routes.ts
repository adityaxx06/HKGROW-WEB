/**
 * Typed route path constants.
 *
 * Always import from here rather than writing string literals in
 * <Link to="...">, navigate('...'), or <NavLink to="...">.
 * Keeps route refactoring a single-file change.
 */

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────────────
  home: '/',

  properties: {
    list: '/properties',
    detail: (slug: string) => `/properties/${slug}`,
  },

  projects: {
    list: '/projects',
    detail: (slug: string) => `/projects/${slug}`,
  },

  about: '/about',

  events: {
    list: '/events',
    detail: (slug: string) => `/events/${slug}`,
  },

  blog: {
    list: '/blog',
    detail: (slug: string) => `/blog/${slug}`,
  },

  contact: '/contact',

  legal: {
    terms: '/terms',
    privacy: '/privacy',
    disclaimer: '/disclaimer',
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    login: '/admin/login',
    dashboard: '/admin',

    properties: {
      list: '/admin/properties',
      new: '/admin/properties/new',
      edit: (id: string) => `/admin/properties/${id}`,
    },

    projects: {
      list: '/admin/projects',
      new: '/admin/projects/new',
      edit: (id: string) => `/admin/projects/${id}`,
    },

    team: {
      list: '/admin/team',
      new: '/admin/team/new',
      edit: (id: string) => `/admin/team/${id}`,
    },

    events: {
      list: '/admin/events',
      new: '/admin/events/new',
      edit: (id: string) => `/admin/events/${id}`,
    },

    blog: {
      list: '/admin/blog',
      new: '/admin/blog/new',
      edit: (id: string) => `/admin/blog/${id}`,
    },

    leads: {
      list: '/admin/leads',
      detail: (id: string) => `/admin/leads/${id}`,
    },

    testimonials: {
      list: '/admin/testimonials',
    },

    legal: {
      list: '/admin/legal',
      edit: (key: string) => `/admin/legal/${key}`,
    },

    settings: {
      general: '/admin/settings',
      content: '/admin/settings/content',
    },
  },
} as const;
