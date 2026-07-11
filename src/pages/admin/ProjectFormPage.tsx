import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminProject, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { TagInput } from '@/components/forms/TagInput';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { projectSchema, type ProjectFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';
import type { ImageEntry } from '@/types/database';

export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: project, isLoading: projectLoading, error: projectError, refetch } = useAdminProject(id ?? '');
  const { mutate: create, isPending: isCreating } = useCreateProject();
  const { mutate: update, isPending: isUpdating } = useUpdateProject();
  const isSaving = isCreating || isUpdating;

  const [images, setImages] = useState<ImageEntry[]>([]);

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { status: 'upcoming', is_featured: false, highlights: [], sort_order: 0 },
  });

  useEffect(() => {
    if (project) {
      reset({
        title:               project.title,
        slug:                project.slug ?? '',
        subtitle:            project.subtitle ?? '',
        description:         project.description ?? '',
        location_area:       project.location_area ?? '',
        location_city:       project.location_city ?? '',
        location_state:      project.location_state ?? '',
        address_full:        project.address_full ?? '',
        launch_date:         project.launch_date ?? '',
        expected_completion: project.expected_completion ?? '',
        possession_date:     project.possession_date ?? '',
        status:              project.status,
        total_units:         project.total_units ?? undefined,
        available_units:     project.available_units ?? undefined,
        highlights:          project.highlights ?? [],
        rera_number:         project.rera_number ?? '',
        rera_valid_until:    project.rera_valid_until ?? '',
        video_url:           project.video_url ?? '',
        is_featured:         project.is_featured,
        sort_order:          project.sort_order,
        seo_title:           project.seo_title ?? '',
        seo_description:     project.seo_description ?? '',
      });
      setImages(project.images ?? []);
    }
  }, [project, reset]);

  function onSubmit(values: ProjectFormValues) {
    const payload = { ...values, images };

    if (isEdit && id) {
      update({ id, patch: payload }, {
        onSuccess: () => { toast.success('Project updated.'); navigate(ROUTES.admin.projects.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Project created.'); navigate(ROUTES.admin.projects.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'New'} Project | Admin`} description="" noindex />

      <QueryBoundary
        isLoading={isEdit && projectLoading}
        error={isEdit ? projectError : null}
        onRetry={refetch}
        isEmpty={isEdit && !projectLoading && !project}
        emptyMessage="Project not found. It may have been deleted."
        verbose
      >
        <AdminPageHeader title={isEdit ? `Edit: ${project?.title ?? '…'}` : 'Add New Project'} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

          <FormSection title="Basic Info" description="Title, subtitle, and current status.">
            <Input label="Title" required error={errors.title?.message} {...register('title')} />
            <Input label="Slug" hint="Auto-generated if left blank." error={errors.slug?.message} {...register('slug')} />
            <Input label="Subtitle" placeholder="Gated community living in Civil Lines" {...register('subtitle')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-primary">Status</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                  {...register('status')}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="fully_sold">Fully Sold</option>
                </select>
              </div>
              <Input label="Sort Order" type="number" {...register('sort_order')} />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="accent-navy-600" {...register('is_featured')} />
              Featured project
            </label>
          </FormSection>

          <FormSection title="Description">
            <Textarea label="Full Description" rows={6} {...register('description')} />
          </FormSection>

          <FormSection title="Location">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Area / Locality" placeholder="Civil Lines" {...register('location_area')} />
              <Input label="City" {...register('location_city')} />
              <Input label="State" {...register('location_state')} />
            </div>
            <Textarea label="Full Address" rows={2} {...register('address_full')} />
          </FormSection>

          <FormSection title="Timeline" description="Launch, expected completion, and possession dates.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Launch Date" type="date" {...register('launch_date')} />
              <Input label="Expected Completion" type="date" {...register('expected_completion')} />
              <Input label="Possession Date" type="date" {...register('possession_date')} />
            </div>
          </FormSection>

          <FormSection title="Units &amp; RERA" description="Inventory counts and regulatory registration.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Total Units" type="number" {...register('total_units')} />
              <Input label="Available Units" type="number" {...register('available_units')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="RERA Number" placeholder="UPRERAPRJ123456" {...register('rera_number')} />
              <Input label="RERA Valid Until" type="date" {...register('rera_valid_until')} />
            </div>
            <Controller
              control={control}
              name="highlights"
              render={({ field }) => (
                <TagInput
                  label="Highlights"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type a highlight and press Enter…"
                  hint="e.g. RERA Registered, Gated Community, Clubhouse & Gym"
                />
              )}
            />
          </FormSection>

          <FormSection title="Images" description="First image is the hero. Drag to reorder.">
            <ImageUploader
              entityPath={`projects/${id ?? 'new'}`}
              images={images}
              onChange={setImages}
            />
          </FormSection>

          <FormSection title="Media">
            <Input label="Video URL" placeholder="https://youtube.com/watch?v=…" error={errors.video_url?.message} {...register('video_url')} />
          </FormSection>

          <FormSection title="SEO" description="Leave blank to use auto-generated values.">
            <Input label="SEO Title" hint="Max 70 characters." error={errors.seo_title?.message} {...register('seo_title')} />
            <Textarea label="SEO Description" rows={3} hint="Max 160 characters." error={errors.seo_description?.message} {...register('seo_description')} />
          </FormSection>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <Button type="submit" isLoading={isSaving} disabled={!isDirty && isEdit}>
              {isEdit ? 'Save Changes' : 'Create Project'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.projects.list)}>
              Cancel
            </Button>
          </div>
        </form>
      </QueryBoundary>
    </>
  );
}
