import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Visual grouping for admin CRUD forms (Property, Project, Blog, etc.)
 *
 * Admin forms are long — this wrapper divides them into labelled sections
 * (e.g. "Basic Info", "Location", "Images", "SEO") with a left label column
 * and a right content column on wider screens.
 *
 * Usage:
 *   <FormSection title="SEO" description="Search engine metadata">
 *     <Input label="SEO Title" {...register('seo_title')} />
 *     <Textarea label="SEO Description" {...register('seo_description')} />
 *   </FormSection>
 */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="grid gap-6 border-b border-gray-100 pb-8 pt-2 lg:grid-cols-3">
      <div>
        <h3 className="text-base font-semibold text-navy-800">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-ink-secondary">{description}</p>
        )}
      </div>
      <div className="space-y-4 lg:col-span-2">{children}</div>
    </div>
  );
}
