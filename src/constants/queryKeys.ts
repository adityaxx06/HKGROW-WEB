/**
 * Centralised query key factory.
 *
 * All React Query cache keys are defined here so that:
 *   - Keys are never duplicated or misspelled across files
 *   - Targeted invalidation is always correct (invalidate by prefix, not literal)
 *   - Refactoring a key name is a single-file change
 *
 * Convention: keys are arrays — the first element is the domain, subsequent
 * elements narrow to a specific record or filter set.
 *
 * Usage:
 *   useQuery({ queryKey: QUERY_KEYS.properties.list() })
 *   useQuery({ queryKey: QUERY_KEYS.properties.detail('some-slug') })
 *   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties.all })
 */

export const QUERY_KEYS = {
  // ── Site-wide ────────────────────────────────────────────────────────────
  settings: {
    all: ['settings'] as const,
    singleton: () => ['settings', 'singleton'] as const,
  },

  contentBlocks: {
    all: ['content_blocks'] as const,
    byPage: (page: string) => ['content_blocks', page] as const,
    byKey: (key: string) => ['content_blocks', 'key', key] as const,
  },

  // ── Properties ───────────────────────────────────────────────────────────
  properties: {
    all: ['properties'] as const,
    /** Public listing — supports filter object as second key element */
    list: <T extends object>(filters?: T) =>
      filters ? (['properties', 'list', filters] as const) : (['properties', 'list'] as const),
    /** Public detail by slug */
    detail: (slug: string) => ['properties', 'detail', slug] as const,
    /** Admin listing (includes drafts + soft-deleted) */
    adminList: <T extends object>(filters?: T) =>
      filters
        ? (['properties', 'admin', 'list', filters] as const)
        : (['properties', 'admin', 'list'] as const),
    /** Admin detail by id */
    adminDetail: (id: string) => ['properties', 'admin', 'detail', id] as const,
    featured: () => ['properties', 'featured'] as const,
  },

  // ── Property Categories ──────────────────────────────────────────────────
  categories: {
    all: ['categories'] as const,
    list: () => ['categories', 'list'] as const,
  },

  // ── Projects ─────────────────────────────────────────────────────────────
  projects: {
    all: ['projects'] as const,
    list: <T extends object>(filters?: T) =>
      filters ? (['projects', 'list', filters] as const) : (['projects', 'list'] as const),
    detail: (slug: string) => ['projects', 'detail', slug] as const,
    adminList: () => ['projects', 'admin', 'list'] as const,
    adminDetail: (id: string) => ['projects', 'admin', 'detail', id] as const,
    featured: () => ['projects', 'featured'] as const,
  },

  // ── Team ─────────────────────────────────────────────────────────────────
  team: {
    all: ['team'] as const,
    list: () => ['team', 'list'] as const,
    adminList: () => ['team', 'admin', 'list'] as const,
    adminDetail: (id: string) => ['team', 'admin', 'detail', id] as const,
  },

  // ── Events ───────────────────────────────────────────────────────────────
  events: {
    all: ['events'] as const,
    upcoming: () => ['events', 'upcoming'] as const,
    past: () => ['events', 'past'] as const,
    detail: (slug: string) => ['events', 'detail', slug] as const,
    adminList: () => ['events', 'admin', 'list'] as const,
    adminDetail: (id: string) => ['events', 'admin', 'detail', id] as const,
  },

  // ── Blog ─────────────────────────────────────────────────────────────────
  blog: {
    all: ['blog'] as const,
    list: <T extends object>(filters?: T) =>
      filters ? (['blog', 'list', filters] as const) : (['blog', 'list'] as const),
    detail: (slug: string) => ['blog', 'detail', slug] as const,
    adminList: <T extends object>(filters?: T) =>
      filters
        ? (['blog', 'admin', 'list', filters] as const)
        : (['blog', 'admin', 'list'] as const),
    adminDetail: (id: string) => ['blog', 'admin', 'detail', id] as const,
    latest: (count: number) => ['blog', 'latest', count] as const,
  },

  // ── Leads ─────────────────────────────────────────────────────────────────
  leads: {
    all: ['leads'] as const,
    list: <T extends object>(filters?: T) =>
      filters ? (['leads', 'list', filters] as const) : (['leads', 'list'] as const),
    detail: (id: string) => ['leads', 'detail', id] as const,
    sourceAnalytics: () => ['leads', 'source_analytics'] as const,
  },

  // ── Testimonials ──────────────────────────────────────────────────────────
  testimonials: {
    all: ['testimonials'] as const,
    featured: () => ['testimonials', 'featured'] as const,
    list: () => ['testimonials', 'list'] as const,
    adminList: () => ['testimonials', 'admin', 'list'] as const,
  },

  // ── Legal Pages ───────────────────────────────────────────────────────────
  legal: {
    all: ['legal'] as const,
    byKey: (key: string) => ['legal', key] as const,
    adminList: () => ['legal', 'admin', 'list'] as const,
    adminHistory: (key: string) => ['legal', 'admin', 'history', key] as const,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
  },
} as const;
