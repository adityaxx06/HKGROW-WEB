import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Mail, Phone, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { WebsiteSettings, ContentBlock } from '@/types/database';

interface FooterContent {
  tagline?: string;
  quick_links?: { label: string; url: string }[];
  legal_links?: { label: string; url: string }[];
  copyright?: string;
}

export function Footer() {
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

  const { data: footerBlock } = useQuery({
    queryKey: ['content_blocks', 'footer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section_key', 'footer')
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data as ContentBlock | null;
    },
  });

  const content = (footerBlock?.content ?? {}) as FooterContent;
  const quickLinks = content.quick_links ?? [];
  const legalLinks = content.legal_links ?? [];

  return (
    <footer className="bg-navy-900 text-navy-50">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <img src="/logo.png" alt="HK Grow Infra" className="h-10 w-10 rounded-sm object-contain" />
            <span className="font-display text-lg font-medium text-white">HK Grow Infra</span>
          </div>
          <p className="text-sm leading-relaxed text-navy-200">
            {content.tagline ?? settings?.tagline ?? 'Building Dreams, Delivering Trust'}
          </p>
          <div className="mt-5 flex gap-4">
            {settings?.facebook_url && (
              <a href={settings.facebook_url} aria-label="Facebook" target="_blank" rel="noreferrer">
                <Facebook className="h-5 w-5 text-navy-300 hover:text-gold-400 transition-colors duration-300" />
              </a>
            )}
            {settings?.instagram_url && (
              <a href={settings.instagram_url} aria-label="Instagram" target="_blank" rel="noreferrer">
                <Instagram className="h-5 w-5 text-navy-300 hover:text-gold-400 transition-colors duration-300" />
              </a>
            )}
            {settings?.youtube_url && (
              <a href={settings.youtube_url} aria-label="YouTube" target="_blank" rel="noreferrer">
                <Youtube className="h-5 w-5 text-navy-300 hover:text-gold-400 transition-colors duration-300" />
              </a>
            )}
            {settings?.linkedin_url && (
              <a href={settings.linkedin_url} aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <Linkedin className="h-5 w-5 text-navy-300 hover:text-gold-400 transition-colors duration-300" />
              </a>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider-luxe text-gold-400">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.url}>
                <Link to={link.url} className="text-navy-200 hover:text-white transition-colors duration-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider-luxe text-gold-400">
            Legal
          </h3>
          <ul className="space-y-2.5 text-sm">
            {legalLinks.map((link) => (
              <li key={link.url}>
                <Link to={link.url} className="text-navy-200 hover:text-white transition-colors duration-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider-luxe text-gold-400">
            Contact
          </h3>
          <ul className="space-y-3.5 text-sm text-navy-200">
            {settings?.address_line1 && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>
                  {settings.address_line1}
                  {settings.address_line2 && <>, {settings.address_line2}</>}
                  {settings.address_city && <>, {settings.address_city}</>}
                  {settings.address_pincode && <> – {settings.address_pincode}</>}
                </span>
              </li>
            )}
            {settings?.phone_primary && (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <a href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`} className="hover:text-white transition-colors duration-300">
                  {settings.phone_primary}
                </a>
              </li>
            )}
            {settings?.email_primary && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email_primary}`} className="hover:text-white transition-colors duration-300">
                  {settings.email_primary}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800 py-5">
        <div className="container-page flex flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-navy-300">
            {content.copyright ?? `© ${new Date().getFullYear()} HK Grow Infra Pvt Ltd. All rights reserved.`}
          </p>
          <p className="text-xs text-navy-500">
            Developed by{' '}
            <a
              href="tel:9598106365"
              className="text-navy-400 hover:text-gold-400 transition-colors duration-300"
            >
              Aditya Soni · 9598106365
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
