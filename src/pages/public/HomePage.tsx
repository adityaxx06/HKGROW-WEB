import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin, BadgeIndianRupee, Hammer, Headphones, CalendarCheck } from 'lucide-react';
import { useSettings, useContentBlock } from '@/hooks/useSettings';
import { useFeaturedProperties } from '@/hooks/useProperties';
import { useFeaturedProjects } from '@/hooks/useProjects';
import { useFeaturedTestimonials } from '@/hooks/useTestimonials';
import { useUpcomingEvents } from '@/hooks/useEvents';
import { useLatestPosts } from '@/hooks/useBlog';
import { usePublicTeamMembers } from '@/hooks/useTeam';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { HeroSection } from '@/components/shared/HeroSection';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { TestimonialsCarousel } from '@/components/shared/TestimonialsCarousel';
import { PropertyImage } from '@/components/shared/PropertyImage';
import { FadeInWhenVisible, StaggerContainer, StaggerItem } from '@/components/shared/Motion';
import { getHeroImage, imageUrl } from '@/lib/imageUrl';
import { buildOrganisationSchema } from '@/utils/seo';
import { formatDate, truncate } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'shield-check':       ShieldCheck,
  'map-pin':            MapPin,
  'badge-indian-rupee': BadgeIndianRupee,
  'hammer':             Hammer,
  'headset':            Headphones,
  'calendar-check':     CalendarCheck,
};

export function HomePage() {
  const { data: settings } = useSettings();
  const { data: heroBlock }  = useContentBlock('hero');
  const { data: statsBlock } = useContentBlock('stats');
  const { data: whyBlock }   = useContentBlock('why_us');
  const { data: ctaBlock }   = useContentBlock('cta_banner');

  const { data: featuredProperties, isLoading: propsLoading } = useFeaturedProperties(6);
  const { data: featuredProjects,   isLoading: projLoading }   = useFeaturedProjects(3);
  const { data: testimonials,       isLoading: testimLoading } = useFeaturedTestimonials(8);
  const { data: upcomingEvents,     isLoading: eventsLoading } = useUpcomingEvents(2);
  const { data: latestPosts,        isLoading: postsLoading }  = useLatestPosts(3);
  const { data: teamMembers }                                   = usePublicTeamMembers();

  const hero  = (heroBlock?.content  ?? {}) as Record<string, string>;
  const stats = (statsBlock?.content ?? {}) as { stats?: { value: string; label: string }[] };
  const why   = (whyBlock?.content   ?? {}) as { heading?: string; subheading?: string; points?: { icon: string; title: string; description: string }[] };
  const cta   = (ctaBlock?.content   ?? {}) as Record<string, string>;

  return (
    <>
      <PageMeta
        title={settings?.seo_default_title ?? 'HK Grow Infra Pvt Ltd | Premium Real Estate in Prayagraj'}
        description={settings?.seo_default_desc ?? 'Discover premium flats, villas, plots and commercial spaces in Prayagraj.'}
        ogImagePath={settings?.seo_og_image_path ?? undefined}
        canonicalPath="/"
        schema={settings ? buildOrganisationSchema(settings) : undefined}
      />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <HeroSection hero={hero} settings={settings} />

      {/* ── 2. Featured Properties ──────────────────────────────────────── */}
      <section className="bg-surface py-24 lg:py-28">
        <div className="container-page">
          <FadeInWhenVisible>
            <div className="mb-14 flex items-end justify-between">
              <div>
                <p className="eyebrow mb-4">Hand-Picked Listings</p>
                <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">
                  Featured Properties
                </h2>
                <p className="mt-3 text-ink-secondary">
                  Prime locations across Prayagraj, RERA registered
                </p>
              </div>
              <Link
                to={ROUTES.properties.list}
                className="hidden items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-gold-700 transition-colors duration-300 sm:flex"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeInWhenVisible>

          <QueryBoundary isLoading={propsLoading} error={null} loadingVariant="skeleton-cards" skeletonCount={6}>
            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProperties?.map((p) => {
                const heroImg = getHeroImage(p.images);
                return (
                  <StaggerItem key={p.id}>
                    <Link
                      to={ROUTES.properties.detail(p.slug)}
                      className="group flex flex-col rounded-lg border border-gray-200/80 bg-white shadow-card transition-all duration-500 hover:shadow-card-lg sm:hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="relative overflow-hidden">
                        <PropertyImage
                          path={heroImg?.path}
                          alt={heroImg?.alt ?? p.title}
                          size="card"
                          aspect="4/3"
                          imgClassName="transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge tone={p.status === 'sold' ? 'red' : p.status === 'coming_soon' ? 'amber' : 'green'}>
                            {p.status === 'coming_soon' ? 'Coming Soon' : p.status === 'sold' ? 'Sold' : 'Available'}
                          </Badge>
                          {p.is_featured && <Badge tone="gold">Featured</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">
                          {p.category_name}
                        </p>
                        <h3 className="mt-2 font-display text-lg font-medium text-navy-800 group-hover:text-navy-600 transition-colors duration-300">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 flex items-center gap-1 text-sm text-ink-secondary">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {[p.location_area, p.location_city].filter(Boolean).join(', ')}
                        </p>
                        <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100">
                          <span className="font-display text-xl font-medium text-navy-700">{p.price_label}</span>
                          {p.area_sqft && (
                            <span className="text-xs text-ink-secondary">
                              {p.area_sqft.toLocaleString('en-IN')} sq ft
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <div className="mt-10 text-center sm:hidden">
              <Link to={ROUTES.properties.list}>
                <Button variant="outline">View All Properties</Button>
              </Link>
            </div>
          </QueryBoundary>
        </div>
      </section>

      {/* ── 3. Stats bar ────────────────────────────────────────────────── */}
      {stats.stats && (
        <section className="bg-navy-900 py-20">
          <div className="container-page grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-8">
            {stats.stats.map((s) => (
              <AnimatedCounter key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Featured Projects ─────────────────────────────────────────── */}
      <section className="py-24 lg:py-28">
        <div className="container-page">
          <FadeInWhenVisible>
            <div className="mb-14 flex items-end justify-between">
              <div>
                <p className="eyebrow mb-4">RERA Registered</p>
                <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">Our Projects</h2>
                <p className="mt-3 text-ink-secondary">Residential & commercial developments in Prayagraj</p>
              </div>
              <Link
                to={ROUTES.projects.list}
                className="hidden items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-gold-700 transition-colors duration-300 sm:flex"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeInWhenVisible>

          <QueryBoundary isLoading={projLoading} error={null} loadingVariant="skeleton-cards" skeletonCount={3}>
            <StaggerContainer className="grid gap-8 lg:grid-cols-3">
              {featuredProjects?.map((project) => {
                const heroImg = getHeroImage(project.images);
                return (
                  <StaggerItem key={project.id}>
                    <Link
                      to={ROUTES.projects.detail(project.slug)}
                      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-card transition-all duration-500 hover:shadow-card-lg sm:hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden">
                        <PropertyImage
                          path={heroImg?.path}
                          alt={heroImg?.alt ?? project.title}
                          size="card"
                          aspect="16/9"
                          imgClassName="transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-xl font-medium text-navy-800 group-hover:text-navy-600 transition-colors duration-300">
                          {project.title}
                        </h3>
                        {project.subtitle && (
                          <p className="mt-1.5 text-sm text-ink-secondary">{project.subtitle}</p>
                        )}
                        <p className="mt-2.5 flex items-center gap-1 text-sm text-ink-secondary">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {[project.location_area, project.location_city].filter(Boolean).join(', ')}
                        </p>
                        {project.highlights.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.highlights.slice(0, 3).map((h) => (
                              <span
                                key={h}
                                className="rounded-sm bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-600"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-auto pt-5">
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 group-hover:text-gold-700 transition-colors duration-300">
                            View Project <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </QueryBoundary>
        </div>
      </section>

      {/* ── 5. Why Choose Us ────────────────────────────────────────────── */}
      {why.points && (
        <section className="bg-surface py-24 lg:py-28">
          <div className="container-page">
            <FadeInWhenVisible className="mb-16 text-center">
              <p className="eyebrow mb-4 justify-center">Why Us</p>
              <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">
                {why.heading ?? 'Why Choose HK Grow Infra'}
              </h2>
              {why.subheading && (
                <p className="mt-4 mx-auto max-w-2xl text-ink-secondary">{why.subheading}</p>
              )}
            </FadeInWhenVisible>

            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {why.points.map((point) => {
                const Icon = ICON_MAP[point.icon];
                return (
                  <StaggerItem key={point.title}>
                    <div className="group rounded-lg border border-gray-200/80 bg-white p-8 shadow-card transition-all duration-500 hover:shadow-card-lg hover:border-gold-200">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-sm bg-navy-50 transition-colors duration-300 group-hover:bg-gold-50">
                        {Icon && <Icon className="h-6 w-6 text-navy-700 transition-colors duration-300 group-hover:text-gold-700" />}
                      </div>
                      <h3 className="font-display text-lg font-medium text-navy-800">{point.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-ink-secondary">
                        {point.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ── 6. Testimonials ─────────────────────────────────────────────── */}
      <section className="py-24 lg:py-28">
        <div className="container-page">
          <FadeInWhenVisible className="mb-16 text-center">
            <p className="eyebrow mb-4 justify-center">Testimonials</p>
            <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">
              What Our Buyers Say
            </h2>
          </FadeInWhenVisible>
          <QueryBoundary isLoading={testimLoading} error={null} loadingVariant="skeleton-cards" skeletonCount={1}>
            {testimonials && testimonials.length > 0 ? (
              <TestimonialsCarousel testimonials={testimonials} />
            ) : (
              <p className="text-center text-ink-secondary">No testimonials yet.</p>
            )}
          </QueryBoundary>
        </div>
      </section>

      {/* ── 7. Team Preview ─────────────────────────────────────────────── */}
      {teamMembers && teamMembers.length > 0 && (
        <section className="bg-navy-900 py-24 text-white lg:py-28">
          <div className="container-page">
            <FadeInWhenVisible className="mb-14 flex items-end justify-between">
              <div>
                <p className="eyebrow mb-4 text-gold-300">Our People</p>
                <h2 className="font-display text-3xl font-medium text-white lg:text-4xl">
                  Leadership Team
                </h2>
              </div>
              <Link
                to={ROUTES.about}
                className="hidden items-center gap-1.5 text-sm font-semibold text-gold-300 hover:text-gold-200 transition-colors duration-300 sm:flex"
              >
                About Us <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeInWhenVisible>

            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.slice(0, 4).map((member) => (
                <StaggerItem key={member.id}>
                  <div className="group text-center">
                    <div className="relative mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border border-gold-400/30 bg-navy-800">
                      {member.photo_path ? (
                        <img
                          src={imageUrl(member.photo_path, 'thumb')}
                          alt={member.full_name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-3xl font-medium text-gold-300">
                          {member.full_name[0]}
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-medium text-white">{member.full_name}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-300">{member.position}</p>
                    {member.department && (
                      <p className="mt-1 text-xs text-navy-300">{member.department}</p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ── 8. Upcoming Events ──────────────────────────────────────────── */}
      <section className="bg-surface py-24 lg:py-28">
        <div className="container-page">
          <FadeInWhenVisible className="mb-14 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-4">Stay Updated</p>
              <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">Upcoming Events</h2>
            </div>
            <Link
              to={ROUTES.events.list}
              className="hidden items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-gold-700 transition-colors duration-300 sm:flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeInWhenVisible>

          <QueryBoundary isLoading={eventsLoading} error={null} loadingVariant="skeleton-list" skeletonCount={2}>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <StaggerContainer className="grid gap-6 md:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <StaggerItem key={event.id}>
                    <Link
                      to={ROUTES.events.detail(event.slug)}
                      className="group flex gap-5 rounded-lg border border-gray-200/80 bg-white p-6 shadow-card transition-all duration-500 hover:shadow-card-lg hover:border-gold-200"
                    >
                      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-sm bg-navy-50 text-center">
                        <p className="font-display text-xl font-medium leading-none text-navy-800">
                          {new Date(event.event_date).getDate()}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-navy-500">
                          {new Date(event.event_date).toLocaleString('default', { month: 'short' })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge tone="green" className="mb-2">{event.is_free ? 'Free' : 'Paid'}</Badge>
                        <h3 className="font-display text-base font-medium text-navy-800 group-hover:text-navy-600 transition-colors duration-300 truncate">
                          {event.title}
                        </h3>
                        {event.venue_name && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-ink-secondary">
                            <MapPin className="h-3.5 w-3.5 shrink-0" /> {event.venue_name}
                          </p>
                        )}
                        {event.short_description && (
                          <p className="mt-1 text-sm text-ink-secondary line-clamp-2">
                            {event.short_description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <p className="text-ink-secondary">No upcoming events scheduled. Check back soon.</p>
            )}
          </QueryBoundary>
        </div>
      </section>

      {/* ── 9. Latest Blog Posts ────────────────────────────────────────── */}
      <section className="py-24 lg:py-28">
        <div className="container-page">
          <FadeInWhenVisible className="mb-14 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-4">Insights</p>
              <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">From Our Blog</h2>
            </div>
            <Link
              to={ROUTES.blog.list}
              className="hidden items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-gold-700 transition-colors duration-300 sm:flex"
            >
              Read all <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeInWhenVisible>

          <QueryBoundary isLoading={postsLoading} error={null} loadingVariant="skeleton-cards" skeletonCount={3}>
            <StaggerContainer className="grid gap-8 md:grid-cols-3">
              {latestPosts?.map((post) => (
                <StaggerItem key={post.id}>
                  <Link
                    to={ROUTES.blog.detail(post.slug)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-card transition-all duration-500 hover:shadow-card-lg sm:hover:-translate-y-1"
                  >
                    {post.cover_image_path ? (
                      <PropertyImage
                        path={post.cover_image_path}
                        alt={post.cover_image_alt ?? post.title}
                        size="card"
                        aspect="16/9"
                        imgClassName="transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-navy-50" />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {post.category && (
                        <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">
                          {post.category}
                        </p>
                      )}
                      <h3 className="mt-2 font-display text-lg font-medium text-navy-800 group-hover:text-navy-600 transition-colors duration-300 leading-snug">
                        {truncate(post.title, 70)}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-2.5 text-sm text-ink-secondary line-clamp-2">{post.excerpt}</p>
                      )}
                      <p className="mt-auto pt-5 text-xs text-ink-secondary border-t border-gray-100">
                        {formatDate(post.published_at)} · {post.reading_time_minutes} min read
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </QueryBoundary>
        </div>
      </section>

      {/* ── 10. CTA Banner ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-900 py-24 text-white lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800" />
        {/* Decorative gold accent */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl" aria-hidden="true" />

        <FadeInWhenVisible>
          <div className="container-page relative z-10 text-center">
            <p className="eyebrow mb-5 justify-center text-gold-300">Get Started</p>
            <h2 className="font-display text-3xl font-medium text-white lg:text-5xl">
              {cta.heading ?? 'Ready to find your perfect property in Prayagraj?'}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-navy-200">
              {cta.subheading ?? 'Book a free consultation with our expert team today.'}
            </p>
            <Link to={cta.cta_url ?? ROUTES.contact} className="mt-10 inline-block">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 shadow-lg"
              >
                {cta.cta_text ?? 'Book Free Consultation'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </FadeInWhenVisible>
      </section>
    </>
  );
}
