import { useQuery } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { WebsiteSettings } from '@/types/database';

/**
 * Floating WhatsApp button, fixed bottom-right on all public pages.
 * Clicking it should also fire a `whatsapp_click` lead via `submit_lead()`
 * with minimal info — wired up in Phase 5 alongside other integrations.
 */
export function WhatsAppButton() {
  const { data: settings } = useQuery({
    queryKey: ['website_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .eq('id', 'singleton')
        .single();
      if (error) throw error;
      return data as WebsiteSettings;
    },
  });

  if (!settings?.whatsapp_number) return null;

  const message = encodeURIComponent(
    settings.whatsapp_greeting || 'Hello! I am interested in your properties in Prayagraj.'
  );
  const href = `https://wa.me/${settings.whatsapp_number}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-card-hover transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
