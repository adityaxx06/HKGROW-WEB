import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useAdminEvent, useCreateEvent, useUpdateEvent } from '@/hooks/useEvents';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { eventSchema, type EventFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';
import type { ImageEntry } from '@/types/database';

/**
 * Converts a stored timestamptz ISO string to the value format required by
 * an <input type="datetime-local"> ("YYYY-MM-DDTHH:mm"), in the browser's
 * local timezone — matching how the input will submit it back.
 */
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Converts a datetime-local input value back to a full ISO string for storage. */
function fromDatetimeLocal(value: string | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: event, isLoading: eventLoading, error: eventError, refetch } = useAdminEvent(id ?? '');
  const { mutate: create, isPending: isCreating } = useCreateEvent();
  const { mutate: update, isPending: isUpdating } = useUpdateEvent();
  const isSaving = isCreating || isUpdating;

  const { data: projects } = useQuery({
    queryKey: QUERY_KEYS.projects.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .is('deleted_at', null)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

  const [images, setImages] = useState<ImageEntry[]>([]);

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { status: 'draft', is_featured: false, is_free: true, sort_order: 0 },
  });

  useEffect(() => {
    if (event) {
      reset({
        title:                 event.title,
        slug:                  event.slug ?? '',
        short_description:     event.short_description ?? '',
        description:           event.description ?? '',
        event_date:            toDatetimeLocal(event.event_date),
        event_end_date:        toDatetimeLocal(event.event_end_date),
        venue_name:            event.venue_name ?? '',
        venue_address:         event.venue_address ?? '',
        google_maps_url:       event.google_maps_url ?? '',
        project_id:            event.project_id ?? '',
        registration_link:     event.registration_link ?? '',
        registration_deadline: toDatetimeLocal(event.registration_deadline),
        max_attendees:         event.max_attendees ?? undefined,
        status:                event.status,
        is_featured:           event.is_featured,
        is_free:               event.is_free,
        sort_order:            event.sort_order,
        seo_title:             event.seo_title ?? '',
        seo_description:       event.seo_description ?? '',
      });
      setImages(event.images ?? []);
    }
  }, [event, reset]);

  function onSubmit(values: EventFormValues) {
    const payload = {
      ...values,
      project_id:            values.project_id || null,
      event_date:             fromDatetimeLocal(values.event_date) ?? new Date().toISOString(),
      event_end_date:         fromDatetimeLocal(values.event_end_date),
      registration_deadline:  fromDatetimeLocal(values.registration_deadline),
      images,
    };

    if (isEdit && id) {
      update({ id, patch: payload }, {
        onSuccess: () => { toast.success('Event updated.'); navigate(ROUTES.admin.events.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Event created.'); navigate(ROUTES.admin.events.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'New'} Event | Admin`} description="" noindex />

      <QueryBoundary
        isLoading={isEdit && eventLoading}
        error={isEdit ? eventError : null}
        onRetry={refetch}
        isEmpty={isEdit && !eventLoading && !event}
        emptyMessage="Event not found. It may have been deleted."
        verbose
      >
        <AdminPageHeader title={isEdit ? `Edit: ${event?.title ?? '…'}` : 'Add New Event'} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

          <FormSection title="Basic Info" description="Title, description, and current status.">
            <Input label="Title" required error={errors.title?.message} {...register('title')} />
            <Input label="Slug" hint="Auto-generated if left blank." error={errors.slug?.message} {...register('slug')} />
            <Input label="Short Description" hint="Shown on listing cards. Max 300 characters." error={errors.short_description?.message} {...register('short_description')} />
            <Textarea label="Full Description" rows={5} {...register('description')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-primary">Status</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                  {...register('status')}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <Input label="Sort Order" type="number" {...register('sort_order')} />
            </div>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="accent-navy-600" {...register('is_featured')} />
                Featured event
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="accent-navy-600" {...register('is_free')} />
                Free entry
              </label>
            </div>
          </FormSection>

          <FormSection title="Date &amp; Time">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Event Start"
                type="datetime-local"
                required
                error={errors.event_date?.message}
                {...register('event_date')}
              />
              <Input
                label="Event End"
                type="datetime-local"
                hint="Optional — leave blank for single-moment events."
                {...register('event_end_date')}
              />
            </div>
            <Input
              label="Registration Deadline"
              type="datetime-local"
              hint="Optional cutoff for sign-ups."
              {...register('registration_deadline')}
            />
          </FormSection>

          <FormSection title="Venue">
            <Input label="Venue Name" placeholder="HK Green Valley Estate Sales Office" {...register('venue_name')} />
            <Textarea label="Venue Address" rows={2} {...register('venue_address')} />
            <Input label="Google Maps URL" error={errors.google_maps_url?.message} {...register('google_maps_url')} />
          </FormSection>

          <FormSection title="Project Link" description="Optionally associate this event with a project.">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Linked Project</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                {...register('project_id')}
              >
                <option value="">None</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </FormSection>

          <FormSection title="Registration" description="External registration link or capacity limit.">
            <Input label="Registration Link" hint="If set, visitors are sent here instead of the built-in inquiry form." error={errors.registration_link?.message} {...register('registration_link')} />
            <Input label="Max Attendees" type="number" {...register('max_attendees')} />
          </FormSection>

          <FormSection title="Images" description="First image is the hero. Drag to reorder.">
            <ImageUploader
              entityPath={`events/${id ?? 'new'}`}
              images={images}
              onChange={setImages}
            />
          </FormSection>

          <FormSection title="SEO" description="Leave blank to use auto-generated values.">
            <Input label="SEO Title" hint="Max 70 characters." error={errors.seo_title?.message} {...register('seo_title')} />
            <Textarea label="SEO Description" rows={3} hint="Max 160 characters." error={errors.seo_description?.message} {...register('seo_description')} />
          </FormSection>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <Button type="submit" isLoading={isSaving} disabled={!isDirty && isEdit}>
              {isEdit ? 'Save Changes' : 'Create Event'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.events.list)}>
              Cancel
            </Button>
          </div>
        </form>
      </QueryBoundary>
    </>
  );
}
