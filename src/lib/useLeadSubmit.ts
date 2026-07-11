import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { LeadSource } from '@/types/database';

export interface LeadFormData {
  full_name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
  property_id?: string;
  event_id?: string;
  blog_post_id?: string;
  preferred_contact?: 'phone' | 'email' | 'whatsapp';
  interest_notes?: string;
  budget_min?: number;
  budget_max?: number;
  requirement_type?: 'Buy' | 'Invest' | 'Rent' | 'Not Sure';
  timeline?: 'Immediate' | '1-3 months' | '3-6 months' | '6-12 months' | '1 year+';
  /** Honeypot field — must be left empty by real users. */
  _hp?: string;
}

export type SubmitLeadResult =
  | { status: 'success'; leadId: string }
  | { status: 'duplicate' }
  | { status: 'error'; message: string };

/**
 * Hook for submitting leads via the submit_lead() SECURITY DEFINER RPC.
 *
 * Automatically captures UTM params from the current URL and referrer.
 * Passes the honeypot field (p_honeypot) so the DB can silently discard
 * bot submissions without returning an error to the bot.
 *
 * Per section 10: all public lead creation goes through submit_lead().
 */
export function useLeadSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitLead(data: LeadFormData): Promise<SubmitLeadResult> {
    setIsSubmitting(true);

    try {
      // Capture UTM parameters from the current URL
      const params = new URLSearchParams(window.location.search);
      const utm_source   = params.get('utm_source')   ?? undefined;
      const utm_medium   = params.get('utm_medium')   ?? undefined;
      const utm_campaign = params.get('utm_campaign') ?? undefined;
      const referrer_url = document.referrer || undefined;

      const { data: result, error } = await supabase.rpc('submit_lead', {
        p_full_name:         data.full_name,
        p_phone:             data.phone,
        p_email:             data.email             ?? null,
        p_message:           data.message           ?? null,
        p_source:            data.source,
        p_property_id:       data.property_id       ?? null,
        p_event_id:          data.event_id          ?? null,
        p_blog_post_id:      data.blog_post_id      ?? null,
        p_referrer_url:      referrer_url            ?? null,
        p_utm_source:        utm_source              ?? null,
        p_utm_medium:        utm_medium              ?? null,
        p_utm_campaign:      utm_campaign            ?? null,
        p_preferred_contact: data.preferred_contact ?? null,
        p_interest_notes:    data.interest_notes    ?? null,
        p_budget_min:        data.budget_min        ?? null,
        p_budget_max:        data.budget_max        ?? null,
        p_requirement_type:  data.requirement_type  ?? null,
        p_timeline:          data.timeline          ?? null,
        p_honeypot:          data._hp               ?? null,
      });

      if (error) {
        // Parse VALIDATION_ERROR prefix from the DB exception message
        const msg = error.message ?? '';
        const userMessage = msg.startsWith('VALIDATION_ERROR:')
          ? msg.replace('VALIDATION_ERROR:', '').trim()
          : 'Something went wrong. Please try again.';
        return { status: 'error', message: userMessage };
      }

      const response = result as { id: string | null; duplicate: boolean; bot?: boolean };

      if (response.duplicate || response.bot) {
        // Treat duplicate/bot as success from the user's perspective
        return { status: 'duplicate' };
      }

      return { status: 'success', leadId: response.id! };
    } catch {
      return { status: 'error', message: 'Network error. Please check your connection.' };
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submitLead, isSubmitting };
}
