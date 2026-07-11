import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useAdminEvents, useSoftDeleteEvent } from '@/hooks/useEvents';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatters';
import { normaliseError } from '@/utils/errors';

export function EventsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminEvents();
  const { mutate: softDelete, isPending: isDeleting } = useSoftDeleteEvent();

  function handleDelete() {
    if (!deleteId) return;
    softDelete(deleteId, {
      onSuccess: () => { toast.success('Event deleted.'); setDeleteId(null); },
      onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
    });
  }

  const deleteTarget = data?.find((e) => e.id === deleteId);
  const now = new Date().toISOString();

  return (
    <>
      <PageMeta title="Events | Admin" description="" noindex />
      <AdminPageHeader
        title="Events"
        subtitle={`${data?.length ?? 0} total`}
        action={
          <Button onClick={() => navigate(ROUTES.admin.events.new)}>
            <Plus className="h-4 w-4" /> Add Event
          </Button>
        }
      />

      <QueryBoundary
        isLoading={isLoading} error={error} onRetry={refetch}
        isEmpty={data?.length === 0} emptyMessage="No events yet."
        loadingVariant="skeleton-list" skeletonCount={3} verbose
      >
        <AdminTable
          columns={['Title', 'Date', 'Venue', 'Status', 'Upcoming', '']}
          isEmpty={data?.length === 0}
        >
          {data?.map((event) => (
            <tr key={event.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-navy-800 max-w-xs truncate">{event.title}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary">{formatDateTime(event.event_date)}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary">{event.venue_name ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge tone={statusToTone(event.status)}>{event.status}</Badge>
              </td>
              <td className="px-4 py-3 text-sm">
                {event.event_date > now
                  ? <Badge tone="green">Upcoming</Badge>
                  : <Badge tone="gray">Past</Badge>}
              </td>
              <AdminTableActions>
                {event.status === 'published' && (
                  <Link to={ROUTES.events.detail(event.slug)} target="_blank"
                    className="rounded p-2 text-ink-secondary hover:bg-gray-100">
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
                <Link to={ROUTES.admin.events.edit(event.id)}
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => setDeleteId(event.id)}
                  className="rounded p-2 text-ink-secondary hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </AdminTableActions>
            </tr>
          ))}
        </AdminTable>
      </QueryBoundary>

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete Event"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete" tone="danger"
      />
    </>
  );
}
