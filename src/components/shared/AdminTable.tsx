/**
 * AdminTable — generic table shell used by every admin list page.
 *
 * Provides:
 *  - Responsive table wrapper with horizontal scroll on mobile
 *  - Consistent column header styling
 *  - Empty state slot
 *  - "Actions" column slot (Edit / Delete / View buttons rendered by caller)
 *
 * Usage:
 *   <AdminTable
 *     columns={['Title', 'Status', 'Price', '']}
 *     isEmpty={data.length === 0}
 *   >
 *     {data.map(row => <tr key={row.id}>...</tr>)}
 *   </AdminTable>
 */

import type { ReactNode } from 'react';

interface AdminTableProps {
  columns: string[];
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function AdminTable({
  columns,
  children,
  isEmpty = false,
  emptyMessage = 'No records found.',
}: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-secondary"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isEmpty ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-center text-ink-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Consistent action cell for edit/delete/view buttons in admin tables. */
export function AdminTableActions({ children }: { children: ReactNode }) {
  return (
    <td className="px-4 py-3">
      <div className="flex items-center justify-end gap-2">{children}</div>
    </td>
  );
}
