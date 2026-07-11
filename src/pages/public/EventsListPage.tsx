import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { useUpcomingEvents, usePastEvents } from '@/hooks/useEvents';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge } from '@/components/ui/Badge';
import { imageUrl, getHeroImage } from '@/lib/imageUrl';
import { formatDateTime } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes';
import { clsx } from 'clsx';

export function EventsListPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: upcoming, isLoading: upcomingLoading, error: upcomingError, refetch: refetchUpcoming } = useUpcomingEvents(20);
  const { data: past, isLoading: pastLoading, error: pastError, refetch: refetchPast } = usePastEvents(20);

  const events = tab === 'upcoming' ? upcoming : past;
  const isLoading = tab === 'upcoming' ? upcomingLoading : pastLoading;
  const error = tab === 'upcoming' ? upcomingError : pastError;
  const refetch = tab === 'upcoming' ? refetchUpcoming : refetchPast;

  return (
    <>
      <PageMeta
        title="Events | HK Grow Infra"
        description="Join HK Grow Infra's site visits, investment seminars, and community events in Prayagraj."
        canonicalPath="/events"
      />

      <div className="container-page py-10">
        <h1 className="text-3xl font-bold text-navy-800">Events</h1>
        <p className="mt-1 text-ink-secondary">Site visits, seminars, and community gatherings</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-gray-200">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px',
                tab === t ? 'border-navy-600 text-navy-700' : 'border-transparent text-ink-secondary hover:text-navy-600'
              )}
            >
              {t} Events
            </button>
          ))}
        </div>

        <div className="mt-8">
          <QueryBoundary
            isLoading={isLoading} error={error} onRetry={refetch}
            isEmpty={events?.length === 0}
            emptyMessage={tab === 'upcoming' ? 'No upcoming events scheduled. Check back soon.' : 'No past events to show.'}
            loadingVariant="skeleton-cards" skeletonCount={4} verbose
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events?.map((event) => {
                const hero = getHeroImage(event.images);
                return (
                  <Link key={event.id} to={ROUTES.events.detail(event.slug)} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover">
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      {hero ? (
                        <img src={imageUrl(hero.path, 'card')} alt={hero.alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-secondary"><Calendar className="h-8 w-8" /></div>
                      )}
                      <Badge tone={event.is_free ? 'green' : 'navy'} className="absolute top-3 left-3">
                        {event.is_free ? 'Free' : 'Paid'}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-navy-800 group-hover:text-navy-600">{event.title}</h2>
                      <p className="mt-2 flex items-center gap-1 text-sm text-ink-secondary">
                        <Calendar className="h-4 w-4" /> {formatDateTime(event.event_date)}
                      </p>
                      {event.venue_name && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-ink-secondary">
                          <MapPin className="h-4 w-4" /> {event.venue_name}
                        </p>
                      )}
                      {event.short_description && (
                        <p className="mt-2 text-sm text-ink-secondary line-clamp-2">{event.short_description}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </QueryBoundary>
        </div>
      </div>
    </>
  );
}
