/**
 * ContactForm — public-facing inquiry form.
 *
 * Form architecture:
 *   - react-hook-form for field state, dirty tracking, validation
 *   - zod schema for type-safe validation rules
 *   - useLeadSubmit() hook handles the RPC call, UTM capture, honeypot
 *   - Three result states: success (thank-you), duplicate (soft success),
 *     error (inline message)
 *
 * The hidden honeypot field `_hp` must be left empty by real users.
 * Bots that fill it get a silent success from the DB without any INSERT.
 *
 * All lead forms across the site follow this same pattern.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLeadSubmit } from '@/lib/useLeadSubmit';
import type { LeadSource } from '@/types/database';
import { PREFERRED_CONTACT_OPTIONS } from '@/constants/ui';

// ── Zod schema ────────────────────────────────────────────────────────────────

const schema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long')
    .regex(/\D/, 'Please enter a valid name'),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number')
    .max(15, 'Phone number is too long')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Enter a valid phone number'),
  email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  preferred_contact: z
    .enum(['phone', 'email', 'whatsapp'])
    .optional(),
  message: z
    .string()
    .max(1000, 'Message is too long')
    .optional(),
  // Honeypot — must stay empty
  _hp: z.string().max(0, '').optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────────────────────

interface ContactFormProps {
  source?: LeadSource;
  propertyId?: string;
  eventId?: string;
  blogPostId?: string;
  /** Pre-fill the message field */
  defaultMessage?: string;
  /** Shown after successful submission */
  successTitle?: string;
  successBody?: string;
}

export function ContactForm({
  source = 'contact_form',
  propertyId,
  eventId,
  blogPostId,
  defaultMessage,
  successTitle = 'Thank you for reaching out!',
  successBody = 'Our team will contact you within 24 hours.',
}: ContactFormProps) {
  const { submitLead, isSubmitting } = useLeadSubmit();
  const [submitResult, setSubmitResult] = useState<'success' | 'duplicate' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: defaultMessage ?? '' },
  });

  async function onSubmit(values: FormValues) {
    setErrorMessage('');
    const result = await submitLead({
      full_name:        values.full_name,
      phone:            values.phone,
      email:            values.email || undefined,
      message:          values.message || undefined,
      preferred_contact: values.preferred_contact,
      source,
      property_id:  propertyId,
      event_id:     eventId,
      blog_post_id: blogPostId,
      _hp:          values._hp,
    });

    if (result.status === 'success' || result.status === 'duplicate') {
      setSubmitResult('success'); // treat duplicate as success for UX
      reset();
    } else {
      setSubmitResult('error');
      setErrorMessage(result.message);
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitResult === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-6 py-10 text-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <h3 className="text-lg font-semibold text-green-800">{successTitle}</h3>
        <p className="text-sm text-green-700">{successBody}</p>
        <button
          onClick={() => setSubmitResult(null)}
          className="mt-2 text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-800"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot — hidden from real users, invisible via CSS (no display:none — bots ignore that) */}
      <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="_hp">Leave this empty</label>
        <input id="_hp" type="text" tabIndex={-1} autoComplete="off" {...register('_hp')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          placeholder="Amit Sharma"
          required
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 98765 43210"
          required
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="amit@example.com"
        hint="Optional — we'll only use this to send you details."
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-primary">
          Preferred Contact Method
        </label>
        <div className="flex flex-wrap gap-3">
          {PREFERRED_CONTACT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                value={opt.value}
                {...register('preferred_contact')}
                className="accent-navy-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <Textarea
        label="Message"
        placeholder="Tell us what you're looking for…"
        rows={4}
        error={errors.message?.message}
        {...register('message')}
      />

      {submitResult === 'error' && (
        <p className="text-sm text-red-600">{errorMessage || 'Something went wrong. Please try again.'}</p>
      )}

      <p className="text-xs text-ink-secondary">
        By submitting, you consent to being contacted by HK Grow Infra via phone,
        email, or WhatsApp. See our{' '}
        <a href="/privacy" className="underline hover:text-navy-600">Privacy Policy</a>.
      </p>

      <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
        Send Inquiry
      </Button>
    </form>
  );
}
