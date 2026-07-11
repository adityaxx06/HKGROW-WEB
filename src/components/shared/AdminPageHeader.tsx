import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Primary action button slot — e.g. <Button onClick={...}>Add New</Button> */
  action?: ReactNode;
}

/**
 * Consistent heading + action bar used at the top of every admin list page.
 * Keeps all admin pages visually aligned without repeating layout code.
 */
export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
