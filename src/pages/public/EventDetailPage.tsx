import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { usePublicEvent } from '@/hooks/useEvents';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ContactForm } from '@/components/forms/ContactForm';
import { imageUrl } from '@/lib/imageUrl';
import { formatDateTime } from '@/utils/formatters';
import { buildBreadcrumbSchema } from '@/utils/seo';
import { ROUTES } from '@/constants/routes';
import { env } from '@/lib/env';

export function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, error, refetch } = usePublicEvent(slug ?? '');

  const sortedImages = event?.images ? [...event.images].sort((a, b) => a.sort - b.sort) : [];
  const isPast = event ? event.event_date < new Date().toISOString() : false;

  return (
    <QueryBoundary
      isLoading={isLoading} error={error} onRetry={refetch}
      isEmpty={!event && !isLoading}
      emptyMessage="Event not found."
      verbose
    >
      {event && (
        <>
          <PageMeta
            title={event.seo_title ?? `${event.title} | HK Grow Infra`}
            description={event.seo_description ?? event.short_description ?? `Join us for ${event.title}.`}
            ogImagePath={sortedImages[0]?.path}
            canonicalPath={`/events/${event.slug}`}
            schema={buildBreadcrumbSchema([
              { name: 'Home', url: env.SITE_URL },
              { name: 'Events', url: `${env.SITE_URL}/events` },
              { name: event.title, url: `${env.SITE_URL}/events/${event.slug}` },
            ])}
          />

          <div className="container-page py-10">
            <nav className="mb-6 text-sm text-ink-secondary">
              <Link to={ROUTES.home} className="hover:text-navy-600">Home</Link> /{' '}
              <Link to={ROUTES.events.list} className="hover:text-navy-600">Events</Link> /{' '}
              <span className="text-ink-primary">{event.title}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div>
                {sortedImages.length > 0 && (
                  <img src={imageUrl(sortedImages[0].path, 'hero')} alt={sortedImages[0].alt} className="mb-6 h-72 w-full rounded-xl object-cover sm:h-96" />
                )}

                <Badge tone={isPast ? 'gray' : 'green'} className="mb-3">{isPast ? 'Past Event' : 'Upcoming'}</Badge>
                <h1 className="text-3xl font-bold text-navy-800">{event.title}</h1>

                <div className="mt-4 space-y-2 text-ink-secondary">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-navy-500" />
                    {formatDateTime(event.event_date)}
                    {event.event_end_date && ` – ${formatDateTime(event.event_end_date)}`}
                  </p>
                  {event.venue_name && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-navy-500" />
                      {event.venue_name}{event.venue_address && `, ${event.venue_address}`}
                      {event.google_maps_url && (
                        <a href={event.google_maps_url} target="_blank" rel="noreferrer" className="text-navy-600 hover:underline inline-flex items-center gap-1">
                          Map <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </p>
                  )}
                </div>

                {event.description && (
                  <div className="mt-6">
                    <p className="text-ink-secondary whitespace-pre-line">{event.description}</p>
                  </div>
                )}

                {/* Gallery for past events */}
                {isPast && sortedImages.length > 1 && (
                  <div className="mt-8">
                    <h2 className="mb-3 text-xl font-semibold text-navy-800">Gallery</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {sortedImages.slice(1).map((img) => (
                        <img key={img.path} src={imageUrl(img.path, 'card')} alt={img.alt} className="h-32 w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Registration sidebar */}
              {!isPast && (
                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                    <h2 className="mb-1 text-lg font-semibold text-navy-800">Register for this event</h2>
                    {event.max_attendees && (
                      <p className="mb-4 text-sm text-ink-secondary">
                        {event.attendee_count} of {event.max_attendees} spots filled
                      </p>
                    )}
                    {event.registration_link ? (
                      <a href={event.registration_link} target="_blank" rel="noreferrer">
                        <Button className="w-full">Register Now</Button>
                      </a>
                    ) : (
                      <ContactForm
                        source="event_registration"
                        eventId={event.id}
                        defaultMessage={`I'd like to register for "${event.title}".`}
                        successTitle="Registration received!"
                        successBody="We'll confirm your spot via phone or email shortly."
                      />
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </>
      )}
    </QueryBoundary>
  );
}
