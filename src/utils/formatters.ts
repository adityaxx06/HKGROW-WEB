/**
 * Display formatting utilities used across public and admin pages.
 * Pure functions — no imports from other project modules.
 */

/** Format a price number as an Indian Rupee string (e.g. 8500000 → "₹85 Lakh") */
export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return 'Price on Request';

  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    return `₹${crore % 1 === 0 ? crore : crore.toFixed(2)} Cr`;
  }
  if (amount >= 100_000) {
    const lakh = amount / 100_000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(1)} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Format area (e.g. 1308 → "1,308 sq ft") */
export function formatArea(sqft: number | null | undefined): string {
  if (sqft == null) return '';
  return `${sqft.toLocaleString('en-IN')} sq ft`;
}

/** Format a date string for display (e.g. "2026-07-18" → "18 Jul 2026") */
export function formatDate(
  dateStr: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', opts);
}

/** Format a timestamptz for event display (e.g. "18 Jul 2026, 10:00 AM") */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/** How long ago — for lead created_at display ("2 hours ago", "3 days ago") */
export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const ms = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  return formatDate(dateStr);
}

/** Truncate text to a character limit with ellipsis */
export function truncate(text: string | null | undefined, limit: number): string {
  if (!text) return '';
  return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}

/** Strip HTML tags — for showing plain-text preview of rich content */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Convert bedrooms count to label ("3 BHK", "Studio", etc.) */
export function bedroomLabel(bedrooms: number | null | undefined): string {
  if (bedrooms == null) return '';
  if (bedrooms === 0) return 'Studio';
  return `${bedrooms} BHK`;
}

/** Build a WhatsApp URL per section 12 */
export function buildWhatsAppUrl(
  number: string,
  greeting: string,
  propertyTitle?: string
): string {
  const text = propertyTitle
    ? `Hello! I am interested in "${propertyTitle}". Please share details.`
    : greeting;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
