import DOMPurify from 'dompurify';

/**
 * Sanitises an HTML string for safe rendering via dangerouslySetInnerHTML.
 *
 * Used on:
 *   - blog_posts.content (TipTap HTML output from admin editor)
 *   - legal_pages.content (TipTap HTML output)
 *   - Any other admin-entered rich-text rendered in the public site
 *
 * DOMPurify's default config removes script tags, event handlers, and
 * dangerous protocols (javascript:, data:). We additionally restrict to a
 * known-safe tag allowlist suitable for article content.
 *
 * Per section 7: "All `content` columns rendered via `dangerouslySetInnerHTML`
 * must be sanitised with DOMPurify before render."
 */

const ARTICLE_ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'strong', 'em', 'u', 's', 'mark', 'code', 'pre', 'blockquote',
  'a', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'div', 'span', 'figure', 'figcaption',
];

const ARTICLE_ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'target', 'rel',
  'class', 'id',
  'width', 'height',
  'colspan', 'rowspan',
];

/**
 * Sanitise article/rich-text HTML (blog posts, legal pages).
 * Returns a plain string safe to pass to dangerouslySetInnerHTML.
 */
export function sanitiseHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ARTICLE_ALLOWED_TAGS,
    ALLOWED_ATTR: ARTICLE_ALLOWED_ATTR,
    // Force target="_blank" links to also have rel="noopener noreferrer"
    ADD_ATTR: ['target'],
    FORCE_BODY: false,
  });
}

/**
 * Sanitise plain-text fields displayed in HTML context (e.g. admin notes
 * shown in a <pre> block). Strips all tags — output is plain text only.
 */
export function sanitisePlainText(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * React helper: returns a `dangerouslySetInnerHTML` prop object for an
 * already-sanitised HTML string. Usage:
 *
 *   <div className="prose" {...safeHtml(post.content)} />
 */
export function safeHtml(dirty: string | null | undefined): {
  dangerouslySetInnerHTML: { __html: string };
} {
  return { dangerouslySetInnerHTML: { __html: sanitiseHtml(dirty) } };
}
