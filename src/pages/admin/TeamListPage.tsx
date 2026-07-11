import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useAdminTeamMembers, useSoftDeleteTeamMember } from '@/hooks/useTeam';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { imageUrl } from '@/lib/imageUrl';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';

export function TeamListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminTeamMembers();
  const { mutate: softDelete, isPending: isDeleting } = useSoftDeleteTeamMember();

  function handleDelete() {
    if (!deleteId) return;
    softDelete(deleteId, {
      onSuccess: () => { toast.success('Team member removed.'); setDeleteId(null); },
      onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
    });
  }

  const deleteTarget = data?.find((m) => m.id === deleteId);

  return (
    <>
      <PageMeta title="Team | Admin" description="" noindex />
      <AdminPageHeader
        title="Team Members"
        subtitle={`${data?.length ?? 0} members`}
        action={
          <Button onClick={() => navigate(ROUTES.admin.team.new)}>
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        }
      />

      <QueryBoundary
        isLoading={isLoading} error={error} onRetry={refetch}
        isEmpty={data?.length === 0} emptyMessage="No team members yet."
        loadingVariant="skeleton-list" skeletonCount={5} verbose
      >
        <AdminTable
          columns={['Member', 'Position', 'Department', 'Status', '']}
          isEmpty={data?.length === 0}
        >
          {data?.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {member.photo_path ? (
                    <img
                      src={imageUrl(member.photo_path, 'thumb')}
                      alt={member.full_name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-sm font-semibold text-navy-700">
                      {member.full_name[0]}
                    </div>
                  )}
                  <span className="font-medium text-navy-800">{member.full_name}</span>
                  {member.is_founder && (
                    <Badge tone="gold">Founder</Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-ink-secondary">{member.position}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary">{member.department ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge tone={member.is_active ? 'green' : 'gray'}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <AdminTableActions>
                <button
                  onClick={() => navigate(ROUTES.admin.team.edit(member.id))}
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(member.id)}
                  className="rounded p-2 text-ink-secondary hover:bg-red-50 hover:text-red-600"
                >
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
        title="Remove Team Member"
        message={`Remove "${deleteTarget?.full_name}" from the team? Their blog post authorship will be preserved.`}
        confirmLabel="Remove" tone="danger"
      />
    </>
  );
}
