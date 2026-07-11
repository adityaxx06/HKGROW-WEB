/**
 * UI constants: pagination sizes, filter options, status labels, priority
 * colours, and other display values used across multiple components.
 */

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZES = {
  properties: 12,
  blog: 9,
  events: 9,
  leadsAdmin: 25,
  adminList: 20,
} as const;

// ── Property filter options ───────────────────────────────────────────────────
export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5] as const;

export const PRICE_RANGE_OPTIONS = [
  { label: 'Under ₹50 Lakh',    min: 0,         max: 5_000_000 },
  { label: '₹50L – ₹1 Cr',     min: 5_000_000,  max: 10_000_000 },
  { label: '₹1 Cr – ₹2 Cr',    min: 10_000_000, max: 20_000_000 },
  { label: '₹2 Cr – ₹5 Cr',    min: 20_000_000, max: 50_000_000 },
  { label: 'Above ₹5 Cr',       min: 50_000_000, max: null },
] as const;

export const POSSESSION_OPTIONS = [
  'Ready to Move',
  'Under Construction',
  'Coming Soon',
] as const;

// ── Lead stage labels and colours (for admin badge rendering) ────────────────
export const LEAD_STAGE_LABELS: Record<string, string> = {
  new:                'New',
  contacted:          'Contacted',
  qualified:          'Qualified',
  site_visit_booked:  'Visit Booked',
  site_visit_done:    'Visit Done',
  negotiation:        'Negotiation',
  documentation:      'Documentation',
  converted:          'Converted',
  lost:               'Lost',
  unresponsive:       'Unresponsive',
};

export const LEAD_PRIORITY_LABELS: Record<string, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
  urgent: 'Urgent',
};

export const LEAD_PRIORITY_TONE: Record<string, 'gray' | 'navy' | 'amber' | 'red'> = {
  low:    'gray',
  medium: 'navy',
  high:   'amber',
  urgent: 'red',
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  contact_form:       'Contact Form',
  property_inquiry:   'Property Inquiry',
  whatsapp_click:     'WhatsApp',
  event_registration: 'Event',
  blog_cta:           'Blog CTA',
  brochure_download:  'Brochure',
  phone_call:         'Phone Call',
  referral:           'Referral',
  walk_in:            'Walk-in',
  site_visit_form:    'Site Visit Form',
  other:              'Other',
};

// ── Property / project / event status labels ─────────────────────────────────
export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  draft:       'Draft',
  active:      'Active',
  sold:        'Sold',
  coming_soon: 'Coming Soon',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  upcoming:   'Upcoming',
  ongoing:    'Ongoing',
  completed:  'Completed',
  fully_sold: 'Fully Sold',
};

// ── Form option arrays (for <select> / radio groups) ─────────────────────────
export const REQUIREMENT_TYPE_OPTIONS = ['Buy', 'Invest', 'Rent', 'Not Sure'] as const;

export const TIMELINE_OPTIONS = [
  'Immediate',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  '1 year+',
] as const;

export const PREFERRED_CONTACT_OPTIONS = [
  { value: 'phone',    label: 'Phone call' },
  { value: 'email',    label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
] as const;

// ── Stale time overrides (ms) for queries that change more/less often ────────
export const STALE = {
  /** Settings and content blocks — rarely change, cache hard */
  static: 30 * 60 * 1000,
  /** Public listings — change only when admin edits */
  listings: 5 * 60 * 1000,
  /** Admin views — want fresh data more often */
  admin: 60 * 1000,
  /** Dashboard stats — refresh every 30 s in admin */
  stats: 30 * 1000,
} as const;
