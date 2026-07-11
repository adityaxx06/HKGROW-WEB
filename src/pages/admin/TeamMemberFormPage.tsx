import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminTeamMember, useCreateTeamMember, useUpdateTeamMember } from '@/hooks/useTeam';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { teamMemberSchema, type TeamMemberFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';
import type { ImageEntry } from '@/types/database';

export function TeamMemberFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: member, isLoading: memberLoading, error: memberError, refetch } = useAdminTeamMember(id ?? '');
  const { mutate: create, isPending: isCreating } = useCreateTeamMember();
  const { mutate: update, isPending: isUpdating } = useUpdateTeamMember();
  const isSaving = isCreating || isUpdating;

  const [photo, setPhoto] = useState<ImageEntry[]>([]);

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { is_active: true, is_founder: false, rank_order: 0 },
  });

  useEffect(() => {
    if (member) {
      reset({
        full_name:     member.full_name,
        position:      member.position,
        department:    member.department ?? '',
        bio:           member.bio ?? '',
        short_bio:     member.short_bio ?? '',
        email:         member.email ?? '',
        phone:         member.phone ?? '',
        display_email: member.display_email ?? '',
        rank_order:    member.rank_order,
        is_active:     member.is_active,
        is_founder:    member.is_founder,
      });
      if (member.photo_path) {
        setPhoto([{ path: member.photo_path, alt: member.full_name, sort: 0 }]);
      }
    }
  }, [member, reset]);

  function onSubmit(values: TeamMemberFormValues) {
    const payload = {
      ...values,
      photo_path: photo[0]?.path ?? null,
    };

    if (isEdit && id) {
      update({ id, patch: payload }, {
        onSuccess: () => { toast.success('Team member updated.'); navigate(ROUTES.admin.team.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Team member added.'); navigate(ROUTES.admin.team.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'New'} Team Member | Admin`} description="" noindex />

      <QueryBoundary
        isLoading={isEdit && memberLoading}
        error={isEdit ? memberError : null}
        onRetry={refetch}
        isEmpty={isEdit && !memberLoading && !member}
        emptyMessage="Team member not found. They may have been removed."
        verbose
      >
        <AdminPageHeader title={isEdit ? `Edit: ${member?.full_name ?? '…'}` : 'Add New Team Member'} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

          <FormSection title="Basic Info" description="Name, role, and department.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" required error={errors.full_name?.message} {...register('full_name')} />
              <Input label="Position" required placeholder="Head of Sales" error={errors.position?.message} {...register('position')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Department" placeholder="Sales, Marketing, Legal…" {...register('department')} />
              <Input label="Display Order" type="number" hint="Lower numbers appear first." {...register('rank_order')} />
            </div>
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="accent-navy-600" {...register('is_active')} />
                Active (visible on website)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" className="accent-navy-600" {...register('is_founder')} />
                Founder
              </label>
            </div>
          </FormSection>

          <FormSection title="Bio" description="Shown on the About page.">
            <Input label="Short Bio" hint="One line — shown on team grid cards. Max 200 characters." error={errors.short_bio?.message} {...register('short_bio')} />
            <Textarea label="Full Bio" rows={5} {...register('bio')} />
          </FormSection>

          <FormSection title="Contact" description="Email and phone are private (admin-only). Display email is shown publicly if provided.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Private Email" type="email" hint="Internal use only — never shown publicly." error={errors.email?.message} {...register('email')} />
              <Input label="Private Phone" hint="Internal use only — never shown publicly." {...register('phone')} />
            </div>
            <Input label="Public Display Email" type="email" hint="Optional — shown on the About page if set." error={errors.display_email?.message} {...register('display_email')} />
          </FormSection>

          <FormSection title="Photo" description="Square photo recommended.">
            <ImageUploader
              entityPath={`team/${id ?? 'new'}`}
              images={photo}
              onChange={setPhoto}
              maxImages={1}
            />
          </FormSection>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <Button type="submit" isLoading={isSaving} disabled={!isDirty && isEdit}>
              {isEdit ? 'Save Changes' : 'Add Team Member'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.team.list)}>
              Cancel
            </Button>
          </div>
        </form>
      </QueryBoundary>
    </>
  );
}
