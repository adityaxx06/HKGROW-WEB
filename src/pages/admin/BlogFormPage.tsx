import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminPost, useCreatePost, useUpdatePost } from '@/hooks/useBlog';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { TagInput } from '@/components/forms/TagInput';
import { RichTextEditor } from '@/components/forms/RichTextEditor';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { blogPostSchema, type BlogPostFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';
import type { ImageEntry } from '@/types/database';

export function BlogFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: post, isLoading } = useAdminPost(id ?? '');
  const { mutate: create, isPending: isCreating } = useCreatePost();
  const { mutate: update, isPending: isUpdating } = useUpdatePost();
  const isSaving = isCreating || isUpdating;

  const [coverImage, setCoverImage] = useState<ImageEntry[]>([]);

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isDirty },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { status: 'draft', tags: [] },
  });

  useEffect(() => {
    if (post) {
      reset({
        title:               post.title,
        slug:                post.slug ?? '',
        excerpt:             post.excerpt ?? '',
        content:             post.content ?? '',
        category:            post.category ?? '',
        tags:                post.tags ?? [],
        author_name_override: post.author_name_override ?? '',
        cover_image_alt:     post.cover_image_alt ?? '',
        status:              post.status,
        seo_title:           post.seo_title ?? '',
        seo_description:     post.seo_description ?? '',
        canonical_url:       post.canonical_url ?? '',
      });
      if (post.cover_image_path) {
        setCoverImage([{ path: post.cover_image_path, alt: post.cover_image_alt ?? '', sort: 0 }]);
      }
    }
  }, [post, reset]);

  function onSubmit(values: BlogPostFormValues) {
    const coverPath = coverImage[0]?.path ?? null;
    const coverAlt  = coverImage[0]?.alt  ?? null;
    const payload = {
      ...values,
      cover_image_path: coverPath,
      cover_image_alt:  coverAlt,
      published_at: values.status === 'published' && !post?.published_at
        ? new Date().toISOString()
        : post?.published_at ?? null,
    };

    if (isEdit && id) {
      update({ id, patch: payload }, {
        onSuccess: () => { toast.success('Post saved.'); navigate(ROUTES.admin.blog.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Post created.'); navigate(ROUTES.admin.blog.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  if (isEdit && isLoading) {
    return <QueryBoundary isLoading={true} error={null}>{null}</QueryBoundary>;
  }

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'New'} Blog Post | Admin`} description="" noindex />
      <AdminPageHeader title={isEdit ? `Edit: ${post?.title ?? '…'}` : 'New Blog Post'} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

        <FormSection title="Content" description="Title, body, and publishing status.">
          <Input label="Title" required error={errors.title?.message} {...register('title')} />
          <Input label="Slug" hint="Auto-generated if blank." {...register('slug')} />
          <Textarea label="Excerpt" rows={2} hint="Shown on listing cards and in meta descriptions." {...register('excerpt')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-primary">Content</label>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Start writing your post…"
                  minHeight="400px"
                />
              )}
            />
          </div>
        </FormSection>

        <FormSection title="Metadata" description="Category, tags, and author.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Category" placeholder="Investment Guide" {...register('category')} />
            <Input label="Author Name (override)" placeholder="Leave blank to use team member" {...register('author_name_override')} />
          </div>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                label="Tags"
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Type tag and press Enter…"
                hint="e.g. prayagraj, investment-guide, rera"
              />
            )}
          />
        </FormSection>

        <FormSection title="Cover Image" description="Displayed at the top of the post and on listing cards.">
          <ImageUploader
            entityPath={`blog/${id ?? 'new'}`}
            images={coverImage}
            onChange={setCoverImage}
            maxImages={1}
          />
          <Input label="Cover Image Alt Text" hint="Describe the image for accessibility and SEO." {...register('cover_image_alt')} />
        </FormSection>

        <FormSection title="Publishing">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Status</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600"
                {...register('status')}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection title="SEO" description="Leave blank to auto-generate from title and excerpt.">
          <Input label="SEO Title" hint="Max 70 characters." error={errors.seo_title?.message} {...register('seo_title')} />
          <Textarea label="SEO Description" rows={3} hint="Max 160 characters." error={errors.seo_description?.message} {...register('seo_description')} />
          <Input label="Canonical URL" hint="Only set if this post has been published elsewhere first." {...register('canonical_url')} />
        </FormSection>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && isEdit}>
            {isEdit ? 'Save Changes' : 'Create Post'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.blog.list)}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
