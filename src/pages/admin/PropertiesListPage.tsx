import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';
import { useAdminProperties, useSoftDeleteProperty } from '@/hooks/useProperties';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pagination } from '@/components/shared/Pagination';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { ROUTES } from '@/constants/routes';
import { PROPERTY_STATUS_LABELS, PAGE_SIZES } from '@/constants/ui';
import { formatPrice } from '@/utils/formatters';
import { normaliseError } from '@/utils/errors';

export function PropertiesListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminProperties({
    status: statusFilter || undefined,
    search: search || undefined,
    page,
    pageSize: PAGE_SIZES.adminList,
  });

  const { mutate: softDelete, isPending: isDeleting } = useSoftDeleteProperty();

  function handleDelete() {
    if (!deleteId) return;
    softDelete(deleteId, {
      onSuccess: () => {
        toast.success('Property moved to trash.');
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(normaliseError(err));
        setDeleteId(null);
      },
    });
  }

  const deleteTarget = data?.data.find((p) => p.id === deleteId);

  return (
    <>
      <PageMeta title="Properties | Admin" description="Manage properties." noindex />
      <AdminPageHeader
        title="Properties"
        subtitle={data ? `${data.count} total` : undefined}
        action={
          <Button onClick={() => navigate(ROUTES.admin.properties.new)}>
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none focus:ring-1 focus:ring-navy-600"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-navy-600 focus:outline-none"
        >
          <option value="">All statuses</option>
          {Object.entries(PROPERTY_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={data?.data.length === 0}
        emptyMessage="No properties found. Add your first property."
        loadingVariant="skeleton-list"
        skeletonCount={5}
        verbose
      >
        <AdminTable
          columns={['Title', 'Category', 'Price', 'Location', 'Status', 'Featured', '']}
          isEmpty={data?.data.length === 0}
        >
          {data?.data.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-navy-800">{p.title}</td>
              <td className="px-4 py-3 text-ink-secondary text-sm">
                {(p as unknown as { property_categories?: { name: string } }).property_categories?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-sm">{formatPrice(p.price_amount)}</td>
              <td className="px-4 py-3 text-sm text-ink-secondary">
                {[p.location_area, p.location_city].filter(Boolean).join(', ') || '—'}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusToTone(p.status)}>
                  {PROPERTY_STATUS_LABELS[p.status] ?? p.status}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {p.is_featured && <Star className="h-4 w-4 text-gold-600" />}
              </td>
              <AdminTableActions>
                <Link
                  to={ROUTES.properties.detail(p.slug)}
                  target="_blank"
                  title="View on site"
                  className="rounded p-2 text-ink-secondary hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  to={ROUTES.admin.properties.edit(p.id)}
                  title="Edit"
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setDeleteId(p.id)}
                  title="Delete"
                  className="rounded p-2 text-ink-secondary hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </AdminTableActions>
            </tr>
          ))}
        </AdminTable>

        <div className="mt-4">
          <Pagination
            page={page}
            pageSize={PAGE_SIZES.adminList}
            totalCount={data?.count ?? 0}
            onPageChange={setPage}
          />
        </div>
      </QueryBoundary>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? It will be soft-deleted and removed from the public site.`}
        confirmLabel="Delete"
        tone="danger"
      />
    </>
  );
}
