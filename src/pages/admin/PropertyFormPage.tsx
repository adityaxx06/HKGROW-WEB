import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useAdminProperty, useCreateProperty, useUpdateProperty } from '@/hooks/useProperties';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { TagInput } from '@/components/forms/TagInput';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { propertySchema, type PropertyFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { normaliseError } from '@/utils/errors';
import type { ImageEntry } from '@/types/database';

export function PropertyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const { data: property, isLoading: propertyLoading } = useAdminProperty(id ?? '');

  const { data: categories } = useQuery({
    queryKey: QUERY_KEYS.categories.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

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

  const { mutate: create, isPending: isCreating } = useCreateProperty();
  const { mutate: update, isPending: isUpdating } = useUpdateProperty();
  const isSaving = isCreating || isUpdating;

  const [images, setImages] = useState<ImageEntry[]>([]);

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isDirty },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      status: 'draft', is_featured: false, is_verified: false,
      amenities: [], sort_order: 0,
    },
  });

  useEffect(() => {
    if (property) {
      reset({
        title:            property.title,
        slug:             property.slug ?? '',
        excerpt:          property.excerpt ?? '',
        description:      property.description ?? '',
        category_id:      property.category_id,
        project_id:       property.project_id ?? '',
        price_label:      property.price_label,
        price_amount:     property.price_amount ?? undefined,
        price_per_sqft:   property.price_per_sqft ?? undefined,
        location_area:    property.location_area ?? '',
        location_city:    property.location_city ?? '',
        location_state:   property.location_state ?? '',
        location_pincode: property.location_pincode ?? '',
        address_full:     property.address_full ?? '',
        area_sqft:        property.area_sqft ?? undefined,
        bedrooms:         property.bedrooms ?? undefined,
        bathrooms:        property.bathrooms ?? undefined,
        floor_number:     property.floor_number ?? undefined,
        total_floors:     property.total_floors ?? undefined,
        facing:           property.facing ?? undefined,
        furnishing_status: property.furnishing_status ?? undefined,
        possession_status: property.possession_status ?? undefined,
        possession_date:  property.possession_date ?? '',
        amenities:        property.amenities ?? [],
        status:           property.status,
        is_featured:      property.is_featured,
        is_verified:      property.is_verified,
        sort_order:       property.sort_order,
        video_url:        property.video_url ?? '',
        map_embed_url:    property.map_embed_url ?? '',
        seo_title:        property.seo_title ?? '',
        seo_description:  property.seo_description ?? '',
      });
      setImages(property.images ?? []);
    }
  }, [property, reset]);

  function onSubmit(values: PropertyFormValues) {
    const payload = { ...values, project_id: values.project_id || null, images };

    if (isEdit && id) {
      update({ id, patch: payload }, {
        onSuccess: () => { toast.success('Property updated.'); navigate(ROUTES.admin.properties.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success('Property created.'); navigate(ROUTES.admin.properties.list); },
        onError: (err) => toast.error(normaliseError(err)),
      });
    }
  }

  if (isEdit && propertyLoading) {
    return <QueryBoundary isLoading={true} error={null}>{null}</QueryBoundary>;
  }

  const FACING_OPTIONS = ['North','South','East','West','North-East','North-West','South-East','South-West'];

  return (
    <>
      <PageMeta title={`${isEdit ? 'Edit' : 'New'} Property | Admin`} description="" noindex />
      <AdminPageHeader title={isEdit ? `Edit: ${property?.title ?? '…'}` : 'Add New Property'} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

        <FormSection title="Basic Info" description="Title, category, project and status.">
          <Input label="Title" required error={errors.title?.message} {...register('title')} />
          <Input label="Slug" hint="Auto-generated if left blank." error={errors.slug?.message} {...register('slug')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">
                Category <span className="text-red-600">*</span>
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600" {...register('category_id')}>
                <option value="">Select category…</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Linked Project</label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600" {...register('project_id')}>
                <option value="">None</option>
                {projects?.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Status</label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm" {...register('status')}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
            <Input label="Sort Order" type="number" {...register('sort_order')} />
          </div>
          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="accent-navy-600" {...register('is_featured')} /> Featured
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="accent-navy-600" {...register('is_verified')} /> Verified
            </label>
          </div>
        </FormSection>

        <FormSection title="Description">
          <Input label="Excerpt" hint="Shown on listing cards (1–2 lines)." {...register('excerpt')} />
          <Textarea label="Full Description" rows={6} {...register('description')} />
        </FormSection>

        <FormSection title="Pricing">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Price Label" required placeholder="₹85 Lakh" error={errors.price_label?.message} {...register('price_label')} />
            <Input label="Price Amount (₹)" type="number" placeholder="8500000" {...register('price_amount')} />
            <Input label="Price / Sq Ft (₹)" type="number" {...register('price_per_sqft')} />
          </div>
        </FormSection>

        <FormSection title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Area / Locality" placeholder="Civil Lines" {...register('location_area')} />
            <Input label="City" {...register('location_city')} />
            <Input label="State" {...register('location_state')} />
            <Input label="Pincode" {...register('location_pincode')} />
          </div>
          <Textarea label="Full Address" rows={2} {...register('address_full')} />
        </FormSection>

        <FormSection title="Property Details">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Area (sq ft)" type="number" {...register('area_sqft')} />
            <Input label="Bedrooms" type="number" {...register('bedrooms')} />
            <Input label="Bathrooms" type="number" {...register('bathrooms')} />
            <Input label="Floor Number" type="number" {...register('floor_number')} />
            <Input label="Total Floors" type="number" {...register('total_floors')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Facing</label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm" {...register('facing')}>
                <option value="">—</option>
                {FACING_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Furnishing</label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm" {...register('furnishing_status')}>
                <option value="">—</option>
                <option>Unfurnished</option>
                <option>Semi-Furnished</option>
                <option>Fully Furnished</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Possession Status</label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm" {...register('possession_status')}>
                <option value="">—</option>
                <option>Ready to Move</option>
                <option>Under Construction</option>
                <option>Coming Soon</option>
              </select>
            </div>
          </div>
          <Input label="Possession Date" type="date" {...register('possession_date')} />
          <Controller
            control={control}
            name="amenities"
            render={({ field }) => (
              <TagInput
                label="Amenities"
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Type and press Enter…"
                hint="e.g. Swimming Pool, 24x7 Security, Covered Parking"
              />
            )}
          />
        </FormSection>

        <FormSection title="Images" description="First image is the hero. Max 12 images.">
          <ImageUploader
            entityPath={`properties/${id ?? 'new'}`}
            images={images}
            onChange={setImages}
          />
        </FormSection>

        <FormSection title="Media">
          <Input label="Video URL" placeholder="https://youtube.com/watch?v=…" {...register('video_url')} />
        </FormSection>

        <FormSection
          title="Map Embed"
          description="Paste the Google Maps embed iframe code or a direct embed URL. To get this: open Google Maps → find the location → Share → Embed a map → copy the src URL or the full iframe HTML."
        >
          <Textarea
            label="Google Maps Embed Code or URL"
            rows={3}
            placeholder='<iframe src="https://www.google.com/maps/embed?pb=…" …></iframe>  — or just the src URL'
            hint="Paste either the full <iframe> tag from Google Maps or just the embed URL from the iframe's src attribute."
            {...register('map_embed_url')}
          />
          <div className="col-span-full rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">How to get the embed code:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Open <strong>Google Maps</strong> and search for the property location</li>
              <li>Click <strong>Share</strong> → select <strong>Embed a map</strong></li>
              <li>Click <strong>Copy HTML</strong> — then paste the entire code above</li>
            </ol>
          </div>
        </FormSection>

        <FormSection title="SEO" description="Leave blank to use auto-generated values.">
          <Input label="SEO Title" hint="Max 70 characters." error={errors.seo_title?.message} {...register('seo_title')} />
          <Textarea label="SEO Description" rows={3} hint="Max 160 characters." error={errors.seo_description?.message} {...register('seo_description')} />
        </FormSection>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
          <Button type="submit" isLoading={isSaving} disabled={!isDirty && isEdit}>
            {isEdit ? 'Save Changes' : 'Create Property'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.admin.properties.list)}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
