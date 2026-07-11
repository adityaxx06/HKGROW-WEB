import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeads, useArchiveLead } from '@/hooks/useLeads';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pagination } from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { ROUTES } from '@/constants/routes';
import {
  LEAD_STAGE_LABELS, LEAD_PRIORITY_LABELS,
  LEAD_PRIORITY_TONE, LEAD_SOURCE_LABELS, PAGE_SIZES,
} from '@/constants/ui';
import { formatDate, timeAgo } from '@/utils/formatters';
import { normaliseError } from '@/utils/errors';
import { Archive, Eye } from 'lucide-react';

export function LeadsListPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useLeads({
    stage:      stageFilter  || undefined,
    priority:   priorityFilter || undefined,
    source:     sourceFilter || undefined,
    search:     search || undefined,
    isArchived: showArchived,
    page,
    pageSize:   PAGE_SIZES.leadsAdmin,
  });

  const { mutate: archive, isPending: isArchiving } = useArchiveLead();

  function handleArchive() {
    if (!archiveId) return;
    archive(archiveId, {
      onSuccess: () => { toast.success('Lead archived.'); setArchiveId(null); },
      onError:   (err) => { toast.error(normaliseError(err)); setArchiveId(null); },
    });
  }

  const archiveTarget = data?.data.find((l) => l.id === archiveId);

  return (
    <>
      <PageMeta title="Leads | Admin" description="Manage leads." noindex />
      <AdminPageHeader
        title="Leads"
        subtitle={data ? `${data.count} ${showArchived ? 'archived' : 'active'} leads` : undefined}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Name or phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
        />
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="">All stages</option>
          {Object.entries(LEAD_STAGE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="">All priorities</option>
          {Object.entries(LEAD_PRIORITY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="">All sources</option>
          {Object.entries(LEAD_SOURCE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <Button
          variant={showArchived ? 'primary' : 'outline'}
          size="sm"
          onClick={() => { setShowArchived(!showArchived); setPage(1); }}
        >
          {showArchived ? 'Viewing Archived' : 'Show Archived'}
        </Button>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={data?.data.length === 0}
        emptyMessage={showArchived ? 'No archived leads.' : 'No leads yet.'}
        loadingVariant="skeleton-list"
        skeletonCount={6}
        verbose
      >
        <AdminTable
          columns={['Name', 'Phone', 'Source', 'Property', 'Stage', 'Priority', 'Follow-up', 'Received', '']}
          isEmpty={data?.data.length === 0}
        >
          {data?.data.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-navy-800">{lead.full_name}</td>
              <td className="px-4 py-3 text-sm">
                <a href={`tel:${lead.phone}`} className="hover:text-navy-600">{lead.phone}</a>
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {lead.property_title
                  ? <Link to={ROUTES.properties.detail(lead.property_slug ?? '')} target="_blank" className="hover:text-navy-600 hover:underline">{lead.property_title}</Link>
                  : '—'
                }
              </td>
              <td className="px-4 py-3">
                <Badge tone={lead.stage === 'converted' ? 'green' : lead.stage === 'lost' ? 'red' : 'navy'}>
                  {LEAD_STAGE_LABELS[lead.stage]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={LEAD_PRIORITY_TONE[lead.priority]}>
                  {LEAD_PRIORITY_LABELS[lead.priority]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {lead.follow_up_date ? formatDate(lead.follow_up_date) : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-ink-secondary" title={lead.created_at}>
                {timeAgo(lead.created_at)}
              </td>
              <AdminTableActions>
                <Link
                  to={ROUTES.admin.leads.detail(lead.id)}
                  title="View lead"
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                {!lead.is_archived && (
                  <button
                    onClick={() => setArchiveId(lead.id)}
                    title="Archive lead"
                    className="rounded p-2 text-ink-secondary hover:bg-amber-50 hover:text-amber-600"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                )}
              </AdminTableActions>
            </tr>
          ))}
        </AdminTable>

        <div className="mt-4">
          <Pagination
            page={page}
            pageSize={PAGE_SIZES.leadsAdmin}
            totalCount={data?.count ?? 0}
            onPageChange={setPage}
          />
        </div>
      </QueryBoundary>

      <ConfirmDialog
        isOpen={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={handleArchive}
        isLoading={isArchiving}
        title="Archive Lead"
        message={`Archive lead from "${archiveTarget?.full_name}"? It will be hidden from the active leads list but retained in the database.`}
        confirmLabel="Archive"
        tone="warning"
      />
    </>
  );
}
