import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { settingsSchema, type SettingsFormValues } from '@/components/forms/formSchemas';
import { normaliseError } from '@/utils/errors';

export function SettingsPage() {
  const toast = useToast();
  const { data: settings, isLoading, error, refetch } = useSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateSettings();

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (settings) {
      reset({
        company_name:      settings.company_name,
        tagline:           settings.tagline ?? '',
        mission:           settings.mission ?? '',
        vision:            settings.vision ?? '',
        phone_primary:     settings.phone_primary ?? '',
        phone_secondary:   settings.phone_secondary ?? '',
        email_primary:     settings.email_primary ?? '',
        email_inquiries:   settings.email_inquiries ?? '',
        admin_alert_email: settings.admin_alert_email ?? '',
        address_line1:     settings.address_line1 ?? '',
        address_line2:     settings.address_line2 ?? '',
        address_city:      settings.address_city ?? '',
        address_state:     settings.address_state ?? '',
        address_pincode:   settings.address_pincode ?? '',
        whatsapp_number:   settings.whatsapp_number ?? '',
        whatsapp_greeting: settings.whatsapp_greeting ?? '',
        facebook_url:      settings.facebook_url ?? '',
        instagram_url:     settings.instagram_url ?? '',
        youtube_url:       settings.youtube_url ?? '',
        linkedin_url:      settings.linkedin_url ?? '',
        twitter_url:       settings.twitter_url ?? '',
        seo_default_title: settings.seo_default_title ?? '',
        seo_default_desc:  settings.seo_default_desc ?? '',
        google_maps_embed: settings.google_maps_embed ?? '',
      });
    }
  }, [settings, reset]);

  function onSubmit(values: SettingsFormValues) {
    updateSettings(values, {
      onSuccess: () => toast.success('Settings saved.'),
      onError: (err) => toast.error(normaliseError(err)),
    });
  }

  return (
    <>
      <PageMeta title="Settings | Admin" description="" noindex />
      <AdminPageHeader title="Website Settings" subtitle="Company info, contact details, social links, and SEO defaults." />

      <QueryBoundary isLoading={isLoading} error={error} onRetry={refetch} verbose>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

          <FormSection title="Company" description="Core identity shown across the site.">
            <Input label="Company Name" required error={errors.company_name?.message} {...register('company_name')} />
            <Input label="Tagline" placeholder="Building Dreams, Delivering Trust" {...register('tagline')} />
            <Textarea label="Mission Statement" rows={3} {...register('mission')} />
            <Textarea label="Vision Statement" rows={3} {...register('vision')} />
          </FormSection>

          <FormSection title="Contact" description="Displayed in footer, contact page, and navbar.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Primary Phone" placeholder="+91 98765 43210" {...register('phone_primary')} />
              <Input label="Secondary Phone" {...register('phone_secondary')} />
              <Input label="Primary Email" type="email" error={errors.email_primary?.message} {...register('email_primary')} />
              <Input label="Inquiries Email" type="email" error={errors.email_inquiries?.message} {...register('email_inquiries')} />
              <Input label="Admin Alert Email" type="email" hint="Receives new lead notifications." error={errors.admin_alert_email?.message} {...register('admin_alert_email')} />
            </div>
          </FormSection>

          <FormSection title="Address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Address Line 1" {...register('address_line1')} />
              <Input label="Address Line 2" {...register('address_line2')} />
              <Input label="City" {...register('address_city')} />
              <Input label="State" {...register('address_state')} />
              <Input label="Pincode" {...register('address_pincode')} />
            </div>
          </FormSection>

          <FormSection title="WhatsApp" description="Floating button on all public pages.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="WhatsApp Number" hint="International format without + (e.g. 919876543210)" {...register('whatsapp_number')} />
            </div>
            <Textarea label="Default Greeting" rows={2} hint="Pre-filled message when visitor clicks WhatsApp button." {...register('whatsapp_greeting')} />
          </FormSection>

          <FormSection title="Social Media">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Facebook URL" type="url" error={errors.facebook_url?.message} {...register('facebook_url')} />
              <Input label="Instagram URL" type="url" error={errors.instagram_url?.message} {...register('instagram_url')} />
              <Input label="YouTube URL" type="url" error={errors.youtube_url?.message} {...register('youtube_url')} />
              <Input label="LinkedIn URL" type="url" error={errors.linkedin_url?.message} {...register('linkedin_url')} />
              <Input label="Twitter/X URL" type="url" error={errors.twitter_url?.message} {...register('twitter_url')} />
            </div>
          </FormSection>

          <FormSection title="Default SEO" description="Used on pages without specific SEO fields.">
            <Input label="Default SEO Title" hint="Max 70 characters." error={errors.seo_default_title?.message} {...register('seo_default_title')} />
            <Textarea label="Default SEO Description" rows={3} hint="Max 160 characters." error={errors.seo_default_desc?.message} {...register('seo_default_desc')} />
          </FormSection>

          <FormSection title="Contact Page Map" description="Shown on the Contact Us page. Paste the Google Maps embed code for your office location.">
            <Textarea
              label="Google Maps Embed Code"
              rows={4}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=…" width="600" height="450" style="border:0;" allowfullscreen loading="lazy"></iframe>'
              hint='Go to Google Maps → find your office → Share → Embed a map → Copy HTML → paste here.'
              {...register('google_maps_embed')}
            />
            {/* Live preview */}
            {(errors.google_maps_embed == null) && (
              <div className="col-span-full rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Steps to get your exact office embed:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Open <strong>Google Maps</strong> and search your office address</li>
                  <li>Right-click on the exact building → <strong>"What's here?"</strong> to pin it precisely</li>
                  <li>Click <strong>Share</strong> → <strong>Embed a map</strong> → <strong>Copy HTML</strong></li>
                  <li>Paste the entire copied code into the field above and save</li>
                </ol>
              </div>
            )}
          </FormSection>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
              Save Settings
            </Button>
          </div>
        </form>
      </QueryBoundary>
    </>
  );
}
