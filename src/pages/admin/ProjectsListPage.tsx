import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useAdminProjects, useSoftDeleteProject } from '@/hooks/useProjects';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { ROUTES } from '@/constants/routes';
import { PROJECT_STATUS_LABELS } from '@/constants/ui';
import { normaliseError } from '@/utils/errors';

export function ProjectsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminProjects();
  const { mutate: softDelete, isPending: isDeleting } = useSoftDeleteProject();

  function handleDelete() {
    if (!deleteId) return;
    softDelete(deleteId, {
      onSuccess: () => { toast.success('Project deleted.'); setDeleteId(null); },
      onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
    });
  }

  const deleteTarget = data?.find((p) => p.id === deleteId);

  return (
    <>
      <PageMeta title="Projects | Admin" description="" noindex />
      <AdminPageHeader
        title="Projects"
        subtitle={`${data?.length ?? 0} total`}
        action={
          <Button onClick={() => navigate(ROUTES.admin.projects.new)}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />

      <QueryBoundary
        isLoading={isLoading} error={error} onRetry={refetch}
        isEmpty={data?.length === 0} emptyMessage="No projects yet."
        loadingVariant="skeleton-list" skeletonCount={3} verbose
      >
        <AdminTable
          columns={['Title', 'Location', 'Status', 'Units', 'RERA', '']}
          isEmpty={data?.length === 0}
        >
          {data?.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-navy-800">{project.title}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {[project.location_area, project.location_city].filter(Boolean).join(', ') || '—'}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusToTone(project.status)}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {project.available_units != null && project.total_units != null
                  ? `${project.available_units} / ${project.total_units}`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-xs text-ink-secondary">{project.rera_number ?? '—'}</td>
              <AdminTableActions>
                <Link to={ROUTES.projects.detail(project.slug)} target="_blank"
                  className="rounded p-2 text-ink-secondary hover:bg-gray-100">
                  <Eye className="h-4 w-4" />
                </Link>
                <Link to={ROUTES.admin.projects.edit(project.id)}
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => setDeleteId(project.id)}
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
        title="Delete Project"
        message={`Delete "${deleteTarget?.title}"? Properties linked to this project will remain but lose their project link.`}
        confirmLabel="Delete" tone="danger"
      />
    </>
  );
}
