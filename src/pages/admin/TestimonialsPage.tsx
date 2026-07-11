import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useAdminTestimonials, useCreateTestimonial,
  useUpdateTestimonial, useHardDeleteTestimonial,
} from '@/hooks/useTestimonials';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { AdminTable, AdminTableActions } from '@/components/shared/AdminTable';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { testimonialSchema, type TestimonialFormValues } from '@/components/forms/formSchemas';
import { normaliseError } from '@/utils/errors';
import type { Testimonial } from '@/types/database';

export function TestimonialsPage() {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminTestimonials();
  const { mutate: create, isPending: isCreating } = useCreateTestimonial();
  const { mutate: update, isPending: isUpdating } = useUpdateTestimonial();
  const { mutate: hardDelete, isPending: isDeleting } = useHardDeleteTestimonial();

  const isSaving = isCreating || isUpdating;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
  });

  function openNew() {
    reset({ is_active: true, is_featured: false, is_verified: false, sort_order: 0, rating: 5 });
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(t: Testimonial) {
    reset({
      customer_name:    t.customer_name,
      designation:      t.designation ?? '',
      quote:            t.quote,
      rating:           t.rating ?? 5,
      property_id:      t.property_id ?? '',
      project_id:       t.project_id ?? '',
      transaction_date: t.transaction_date ?? '',
      is_verified:      t.is_verified,
      is_active:        t.is_active,
      is_featured:      t.is_featured,
      sort_order:       t.sort_order,
    });
    setEditTarget(t);
    setFormOpen(true);
  }

  function onSubmit(values: TestimonialFormValues) {
    const payload = {
      ...values,
      property_id: values.property_id || null,
      project_id:  values.project_id  || null,
    };

    if (editTarget) {
      update({ id: editTarget.id, patch: payload }, {
        onSuccess: () => { toast.success('Testimonial updated.'); setFormOpen(false); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Testimonial added.'); setFormOpen(false); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  function handleDelete() {
    if (!deleteId) return;
    hardDelete(deleteId, {
      onSuccess: () => { toast.success('Testimonial deleted.'); setDeleteId(null); },
      onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
    });
  }

  const deleteTarget = data?.find((t) => t.id === deleteId);

  return (
    <>
      <PageMeta title="Testimonials | Admin" description="" noindex />
      <AdminPageHeader
        title="Testimonials"
        subtitle={`${data?.length ?? 0} total`}
        action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Add Testimonial</Button>}
      />

      <QueryBoundary
        isLoading={isLoading} error={error} onRetry={refetch}
        isEmpty={data?.length === 0} emptyMessage="No testimonials yet."
        loadingVariant="skeleton-list" skeletonCount={4} verbose
      >
        <AdminTable
          columns={['Customer', 'Rating', 'Featured', 'Active', 'Verified', '']}
          isEmpty={data?.length === 0}
        >
          {data?.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-navy-800">{t.customer_name}</p>
                {t.designation && <p className="text-xs text-ink-secondary">{t.designation}</p>}
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-0.5 text-sm text-gold-600">
                  {t.rating ?? '—'}
                  {t.rating && <Star className="h-3 w-3 fill-current" />}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge tone={t.is_featured ? 'gold' : 'gray'}>{t.is_featured ? 'Yes' : 'No'}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={t.is_active ? 'green' : 'gray'}>{t.is_active ? 'Yes' : 'No'}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={t.is_verified ? 'green' : 'gray'}>{t.is_verified ? 'Yes' : 'No'}</Badge>
              </td>
              <AdminTableActions>
                <button onClick={() => openEdit(t)}
                  className="rounded p-2 text-ink-secondary hover:bg-navy-50 hover:text-navy-700">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleteId(t.id)}
                  className="rounded p-2 text-ink-secondary hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </AdminTableActions>
            </tr>
          ))}
        </AdminTable>
      </QueryBoundary>

      {/* Add / Edit modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editTarget ? 'Edit Testimonial' : 'Add Testimonial'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Customer Name" required error={errors.customer_name?.message} {...register('customer_name')} />
            <Input label="Designation" placeholder="Engineer, Prayagraj" {...register('designation')} />
          </div>
          <Textarea label="Testimonial Quote" required rows={4} error={errors.quote?.message} {...register('quote')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Rating (1–5)" type="number" min={1} max={5} {...register('rating')} />
            <Input label="Transaction Date" type="date" {...register('transaction_date')} />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-navy-600" {...register('is_verified')} /> Verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-navy-600" {...register('is_featured')} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-navy-600" {...register('is_active')} /> Active
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>
              {editTarget ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete Testimonial"
        message={`Permanently delete testimonial from "${deleteTarget?.customer_name}"? This cannot be undone.`}
        confirmLabel="Delete" tone="danger"
      />
    </>
  );
}
