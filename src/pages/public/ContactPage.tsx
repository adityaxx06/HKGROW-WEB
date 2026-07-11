import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { ContactForm } from '@/components/forms/ContactForm';
import { PageMeta } from '@/components/ui/PageMeta';
import { FadeInWhenVisible, StaggerContainer, StaggerItem } from '@/components/shared/Motion';
import { buildWhatsAppUrl } from '@/utils/formatters';

export function ContactPage() {
  const { data: settings } = useSettings();

  return (
    <>
      <PageMeta
        title="Contact Us | HK Grow Infra Pvt Ltd"
        description="Get in touch with HK Grow Infra for property inquiries in Prayagraj. Call, email, WhatsApp, or visit our Civil Lines office."
        canonicalPath="/contact"
      />

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <section className="bg-navy-900 py-20 text-white lg:py-28">
        <FadeInWhenVisible className="container-page max-w-2xl text-center">
          <p className="eyebrow mb-5 justify-center text-gold-300">Get In Touch</p>
          <h1 className="font-display text-4xl font-medium leading-tight text-white lg:text-5xl">Contact Us</h1>
          <p className="mt-5 text-lg text-navy-200">
            We&rsquo;d love to hear about your property requirements
          </p>
        </FadeInWhenVisible>
      </section>

      <div className="container-page py-24 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
          {/* ── Map + contact details ──────────────────────────────────── */}
          <FadeInWhenVisible className="min-w-0">
            {settings?.google_maps_embed && (
              <div
                className="map-embed-wrap mb-8 overflow-hidden rounded-lg border border-gray-200/80 shadow-card"
                dangerouslySetInnerHTML={{ __html: settings.google_maps_embed }}
              />
            )}

            <StaggerContainer className="grid gap-5 sm:grid-cols-2">
              {settings?.address_line1 && (
                <StaggerItem>
                  <div className="h-full rounded-lg border border-gray-200/80 bg-white p-6 shadow-card transition-shadow duration-500 hover:shadow-card-hover">
                    <MapPin className="h-5 w-5 text-gold-600" />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-800">Office Address</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                      {settings.address_line1}
                      {settings.address_line2 && <>, {settings.address_line2}</>}
                      <br />
                      {settings.address_city}, {settings.address_state} – {settings.address_pincode}
                    </p>
                  </div>
                </StaggerItem>
              )}
              {settings?.phone_primary && (
                <StaggerItem>
                  <div className="h-full rounded-lg border border-gray-200/80 bg-white p-6 shadow-card transition-shadow duration-500 hover:shadow-card-hover">
                    <Phone className="h-5 w-5 text-gold-600" />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-800">Call Us</p>
                    <a href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`} className="mt-2 block text-sm text-navy-700 hover:text-gold-700 transition-colors duration-300">
                      {settings.phone_primary}
                    </a>
                    {settings.phone_secondary && (
                      <a href={`tel:${settings.phone_secondary.replace(/\s+/g, '')}`} className="block text-sm text-navy-700 hover:text-gold-700 transition-colors duration-300">
                        {settings.phone_secondary}
                      </a>
                    )}
                  </div>
                </StaggerItem>
              )}
              {settings?.email_primary && (
                <StaggerItem>
                  <div className="h-full rounded-lg border border-gray-200/80 bg-white p-6 shadow-card transition-shadow duration-500 hover:shadow-card-hover">
                    <Mail className="h-5 w-5 text-gold-600" />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-800">Email Us</p>
                    <a href={`mailto:${settings.email_primary}`} className="mt-2 block text-sm text-navy-700 hover:text-gold-700 transition-colors duration-300 break-words">
                      {settings.email_primary}
                    </a>
                  </div>
                </StaggerItem>
              )}
              {settings?.whatsapp_number && (
                <StaggerItem>
                  <div className="h-full rounded-lg border border-gray-200/80 bg-white p-6 shadow-card transition-shadow duration-500 hover:shadow-card-hover">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-800">WhatsApp</p>
                    <a
                      href={buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_greeting ?? '')}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm text-navy-700 hover:text-gold-700 transition-colors duration-300"
                    >
                      Chat with us
                    </a>
                  </div>
                </StaggerItem>
              )}
            </StaggerContainer>
          </FadeInWhenVisible>

          {/* ── Contact form ────────────────────────────────────────────── */}
          <FadeInWhenVisible delay={0.15} className="min-w-0">
            <div className="rounded-lg border border-gray-200/80 bg-white p-8 shadow-card-lg sm:p-10">
              <p className="eyebrow mb-3">Send a Message</p>
              <h2 className="font-display text-2xl font-medium text-navy-800">Let&rsquo;s Talk</h2>
              <p className="mt-2 text-sm text-ink-secondary">
                Share your requirements and our team will respond within 24 hours.
              </p>
              <div className="mt-7">
                <ContactForm source="contact_form" />
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>
    </>
  );
}
