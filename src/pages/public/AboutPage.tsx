import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Twitter, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePublicTeamMembers } from '@/hooks/useTeam';
import { useContentBlock, useSettings } from '@/hooks/useSettings';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Button } from '@/components/ui/Button';
import { FadeInWhenVisible, StaggerContainer, StaggerItem } from '@/components/shared/Motion';
import { imageUrl } from '@/lib/imageUrl';
import { ROUTES } from '@/constants/routes';

// interface Metric { value: string; label: string }
// interface Milestone { year: string; title: string; description: string }

export function AboutPage() {
  const { data: settings } = useSettings();
  const { data: introBlock }    = useContentBlock('about_intro');
  // const { data: metricsBlock }  = useContentBlock('about_trust_metrics');
  // const { data: milestoneBlock } = useContentBlock('about_milestones');
  const { data: team, isLoading, error, refetch } = usePublicTeamMembers();

  const intro = (introBlock?.content ?? {}) as { heading?: string; subheading?: string; body?: string };
  // const metrics = (metricsBlock?.content ?? {}) as { metrics?: Metric[] };
  // const journey = (milestoneBlock?.content ?? {}) as {
  //   heading?: string;
  //   subheading?: string;
  //   milestones?: Milestone[];
  // };

  return (
    <>
      <PageMeta
        title="About Us | HK Grow Infra Pvt Ltd"
        description="Learn about HK Grow Infra, a Prayagraj-based real estate developer building trust through quality construction and transparent dealings."
        canonicalPath="/about"
      />

      {/* ── 1. Intro hero ──────────────────────────────────────────────── */}
      <section className="bg-navy-900 py-24 text-white lg:py-32">
        <FadeInWhenVisible className="container-page max-w-3xl text-center">
          <p className="eyebrow mb-5 justify-center text-gold-300">About Us</p>
          <h1 className="font-display text-4xl font-medium leading-tight text-white lg:text-5xl">
            {intro.heading ?? 'About HK Grow Infra'}
          </h1>
          <p className="mt-5 text-lg text-navy-200">
            {intro.subheading ?? 'Fifteen years of building trust across Prayagraj'}
          </p>
        </FadeInWhenVisible>
      </section>

      {/* ── 2. Trust metrics bar ─────────────────────────────────────────
      {metrics.metrics && metrics.metrics.length > 0 && (
        <section className="bg-navy-800 py-16">
          <div className="container-page grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-8">
            {metrics.metrics.map((m) => (
              <AnimatedCounter key={m.label} value={m.value} label={m.label} />
            ))}
          </div>
        </section>
      )} */}

      {/* ── 3. Brand story body ────────────────────────────────────────── */}
      <section className="py-24 lg:py-28">
        <FadeInWhenVisible className="container-page max-w-2xl">
          <p className="eyebrow mb-5">Our Story</p>
          <p className="font-display text-xl font-normal leading-relaxed text-navy-800 sm:text-2xl">
            {intro.body ?? settings?.mission}
          </p>
        </FadeInWhenVisible>
      </section>

      {/* ── 4. Milestones timeline ───────────────────────────────────────
      {journey.milestones && journey.milestones.length > 0 && (
        <section className="bg-surface py-24 lg:py-28">
          <div className="container-page">
            <FadeInWhenVisible className="mb-16 text-center">
              <p className="eyebrow mb-4 justify-center">Our History</p>
              <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">
                {journey.heading ?? 'Our Journey'}
              </h2>
              {journey.subheading && (
                <p className="mt-4 mx-auto max-w-2xl text-ink-secondary">{journey.subheading}</p>
              )}
            </FadeInWhenVisible> */}

            {/* <div className="relative mx-auto max-w-3xl"> */}
              {/* Vertical gold rule */}
              {/* <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gold-200 sm:left-1/2" aria-hidden="true" /> */}

              {/* <StaggerContainer className="space-y-10">
                {journey.milestones.map((m, i) => (
                  <StaggerItem key={m.year}>
                    <div
                      className={`relative flex flex-col gap-4 pl-8 sm:flex-row sm:gap-10 sm:pl-0 ${
                        i % 2 === 1 ? 'sm:flex-row-reverse sm:text-right' : ''
                      }`} */}
                    {/* > */}
                      {/* Dot */}
                      {/* <span
                        className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-gold-500 bg-white sm:left-1/2 sm:-translate-x-1/2"
                        aria-hidden="true" */}
                      {/* /> */}
                      {/* <div className="sm:w-1/2 sm:px-10">
                        <p className="font-display text-2xl font-medium text-gold-700">{m.year}</p>
                      </div>
                      <div className="sm:w-1/2 sm:px-10">
                        <h3 className="font-display text-lg font-medium text-navy-800">{m.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{m.description}</p> */}
                      {/* </div> */}
              {/* //       </div> */}
                  {/* // </StaggerItem> */}
              {/* //   ))} */}
              {/* // </StaggerContainer> */}
            {/* // </div> */}
          {/* // </div> */}
        {/* // </section> */}
      {/* // )} */}

      {/* ── 5. Mission & Vision ────────────────────────────────────────── */}
      {(settings?.mission || settings?.vision) && (
        <section className="py-24 lg:py-28">
          <div className="container-page">
            <FadeInWhenVisible className="mb-14 text-center">
              <p className="eyebrow mb-4 justify-center">What Drives Us</p>
              <h2 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">
                Mission &amp; Vision
              </h2>
            </FadeInWhenVisible>

            <StaggerContainer className="grid gap-8 sm:grid-cols-2">
              {settings?.mission && (
                <StaggerItem>
                  <div className="h-full rounded-lg border border-gray-200/80 bg-white p-10 shadow-card">
                    <ShieldCheck className="h-8 w-8 text-gold-600" />
                    <h3 className="mt-5 font-display text-xl font-medium text-navy-800">Our Mission</h3>
                    <span className="mt-3 block h-px w-10 bg-gold-400/50" aria-hidden="true" />
                    <p className="mt-5 leading-relaxed text-ink-secondary">{settings.mission}</p>
                  </div>
                </StaggerItem>
              )}
              {settings?.vision && (
                <StaggerItem>
                  <div className="h-full rounded-lg border border-gray-200/80 bg-white p-10 shadow-card">
                    <ShieldCheck className="h-8 w-8 text-gold-600" />
                    <h3 className="mt-5 font-display text-xl font-medium text-navy-800">Our Vision</h3>
                    <span className="mt-3 block h-px w-10 bg-gold-400/50" aria-hidden="true" />
                    <p className="mt-5 leading-relaxed text-ink-secondary">{settings.vision}</p>
                  </div>
                </StaggerItem>
              )}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ── 6. Executive team ──────────────────────────────────────────── */}
      <section className="bg-navy-900 py-24 text-white lg:py-28">
        <div className="container-page">
          <FadeInWhenVisible className="mb-16 text-center">
            <p className="eyebrow mb-4 justify-center text-gold-300">Leadership</p>
            <h2 className="font-display text-3xl font-medium text-white lg:text-4xl">Meet Our Team</h2>
            <p className="mt-4 mx-auto max-w-xl text-navy-200">
              The people behind HK Grow Infra&rsquo;s growth in Prayagraj
            </p>
          </FadeInWhenVisible>

          <QueryBoundary
            isLoading={isLoading} error={error} onRetry={refetch}
            isEmpty={team?.length === 0} emptyMessage="Team info coming soon."
            loadingVariant="skeleton-cards" skeletonCount={5} verbose
          >
            <StaggerContainer className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {team?.map((member) => (
                <StaggerItem key={member.id}>
                  <div className="group text-center">
                    <div className="relative mx-auto mb-5 h-32 w-32 overflow-hidden rounded-full border border-gold-400/30 bg-navy-800">
                      {member.photo_path ? (
                        <img
                          src={imageUrl(member.photo_path, 'card')}
                          alt={member.full_name}
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
                    {member.short_bio && (
                      <p className="mt-3 text-sm leading-relaxed text-navy-300">{member.short_bio}</p>
                    )}
                    {member.social_links && Object.keys(member.social_links).length > 0 && (
                      <div className="mt-4 flex justify-center gap-4">
                        {member.social_links.linkedin && (
                          <a href={member.social_links.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.full_name} on LinkedIn`}>
                            <Linkedin className="h-4 w-4 text-navy-300 hover:text-gold-300 transition-colors duration-300" />
                          </a>
                        )}
                        {member.social_links.instagram && (
                          <a href={member.social_links.instagram} target="_blank" rel="noreferrer" aria-label={`${member.full_name} on Instagram`}>
                            <Instagram className="h-4 w-4 text-navy-300 hover:text-gold-300 transition-colors duration-300" />
                          </a>
                        )}
                        {member.social_links.twitter && (
                          <a href={member.social_links.twitter} target="_blank" rel="noreferrer" aria-label={`${member.full_name} on Twitter`}>
                            <Twitter className="h-4 w-4 text-navy-300 hover:text-gold-300 transition-colors duration-300" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </QueryBoundary>
        </div>
      </section>

      {/* ── 7. CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 text-center lg:py-28">
        <FadeInWhenVisible className="container-page">
          <h2 className="font-display text-2xl font-medium text-navy-800 lg:text-3xl">
            Ready to start your journey with us?
          </h2>
          <Link to={ROUTES.contact} className="mt-8 inline-block">
            <Button size="lg" variant="primary" className="gap-2">
              Book Free Consultation
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </FadeInWhenVisible>
      </section>
    </>
  );
}
