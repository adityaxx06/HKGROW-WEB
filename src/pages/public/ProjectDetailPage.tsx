import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicProject } from '@/hooks/useProjects';
import { supabase } from '@/lib/supabase';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { PropertyImage } from '@/components/shared/PropertyImage';
import { StaggerContainer, StaggerItem } from '@/components/shared/Motion';
import { imageUrl, getHeroImage } from '@/lib/imageUrl';
import { formatDate } from '@/utils/formatters';
import { buildBreadcrumbSchema } from '@/utils/seo';
import { PROJECT_STATUS_LABELS } from '@/constants/ui';
import { ROUTES } from '@/constants/routes';
import { env } from '@/lib/env';
import type { PropertyPublic } from '@/types/database';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error, refetch } = usePublicProject(slug ?? '');

  const { data: linkedProperties } = useQuery({
    queryKey: ['properties', 'by-project', project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties_public')
        .select('*')
        .eq('project_id', project!.id)
        .order('sort_order');
      if (error) throw error;
      return data as PropertyPublic[];
    },
    enabled: !!project?.id,
  });

  const sortedImages = project?.images ? [...project.images].sort((a, b) => a.sort - b.sort) : [];
  const [activeImage, setActiveImage] = useState(0);

  return (
    <QueryBoundary
      isLoading={isLoading} error={error} onRetry={refetch}
      isEmpty={!project && !isLoading}
      emptyMessage="Project not found."
      verbose
    >
      {project && (
        <>
          <PageMeta
            title={project.seo_title ?? `${project.title} | HK Grow Infra`}
            description={project.seo_description ?? project.subtitle ?? `${project.title} — a project by HK Grow Infra in ${project.location_city ?? 'Prayagraj'}.`}
            ogImagePath={project.seo_og_image_path ?? sortedImages[0]?.path}
            canonicalPath={`/projects/${project.slug}`}
            schema={buildBreadcrumbSchema([
              { name: 'Home', url: env.SITE_URL },
              { name: 'Projects', url: `${env.SITE_URL}/projects` },
              { name: project.title, url: `${env.SITE_URL}/projects/${project.slug}` },
            ])}
          />

          {/* Hero image */}
          {sortedImages.length > 0 && (
            <div className="relative overflow-hidden bg-navy-900" style={{ minHeight: '420px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="h-[420px] sm:h-[520px]"
                >
                  <PropertyImage
                    path={sortedImages[activeImage]?.path}
                    alt={sortedImages[activeImage]?.alt ?? project.title}
                    size="hero"
                    aspect="auto"
                    eager
                    className="h-[420px] sm:h-[520px]"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/30 to-transparent" />
              <div className="container-page absolute bottom-0 left-0 right-0 pb-16 text-white sm:pb-10">
                <Badge tone={statusToTone(project.status)} className="mb-3">{PROJECT_STATUS_LABELS[project.status]}</Badge>
                <h1 className="break-words text-2xl font-extrabold sm:text-4xl lg:text-5xl">{project.title}</h1>
                {project.subtitle && <p className="mt-2 text-base text-navy-100 sm:text-lg">{project.subtitle}</p>}
                <p className="mt-2 flex items-start gap-1 text-navy-200">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="break-words">{[project.location_area, project.location_city].filter(Boolean).join(', ')}</span>
                </p>
              </div>
              {/* Thumbnail strip */}
              {sortedImages.length > 1 && (
                <div className="no-scrollbar absolute bottom-3 left-3 right-3 flex gap-1.5 overflow-x-auto sm:bottom-4 sm:left-auto sm:right-4">
                  {sortedImages.slice(0, 5).map((img, i) => (
                    <button
                      key={img.path}
                      onClick={() => setActiveImage(i)}
                      className={`h-10 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all sm:h-12 sm:w-16 ${i === activeImage ? 'border-white' : 'border-white/40 opacity-60 hover:opacity-90'}`}
                    >
                      <img src={imageUrl(img.path, 'thumb')} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="container-page py-10">
            <nav className="mb-6 text-sm text-ink-secondary">
              <Link to={ROUTES.home} className="hover:text-navy-600">Home</Link> /{' '}
              <Link to={ROUTES.projects.list} className="hover:text-navy-600">Projects</Link> /{' '}
              <span className="text-ink-primary">{project.title}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
              <div className="min-w-0">
                {project.description && (
                  <div className="mb-8">
                    <h2 className="mb-3 text-xl font-semibold text-navy-800">About this project</h2>
                    <p className="text-ink-secondary whitespace-pre-line">{project.description}</p>
                  </div>
                )}

                {project.highlights.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-3 text-xl font-semibold text-navy-800">Highlights</h2>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {project.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-sm text-ink-secondary">
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> {h}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked properties */}
                {linkedProperties && linkedProperties.length > 0 && (
                  <div className="mb-8">
                    <h2 className="mb-4 text-xl font-bold text-navy-800">Available Properties in this Project</h2>
                    <StaggerContainer className="grid gap-4 sm:grid-cols-2">
                      {linkedProperties.map((p) => {
                        const hero = getHeroImage(p.images);
                        return (
                          <StaggerItem key={p.id}>
                            <Link to={ROUTES.properties.detail(p.slug)} className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card transition-all duration-300 hover:shadow-card-lg hover:-translate-y-0.5">
                              <PropertyImage
                                path={hero?.path}
                                alt={hero?.alt ?? p.title}
                                size="card"
                                aspect="16/9"
                                imgClassName="group-hover:scale-105"
                              />
                              <div className="p-4">
                                <h3 className="text-sm font-bold text-navy-800 group-hover:text-navy-600 transition-colors truncate">{p.title}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                  <p className="font-extrabold text-navy-700">{p.price_label}</p>
                                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-navy-500 group-hover:text-gold-600 transition-colors">
                                    View <ArrowRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </StaggerItem>
                        );
                      })}
                    </StaggerContainer>
                  </div>
                )}

                {project.address_full && (
                  <div>
                    <h2 className="mb-3 text-xl font-semibold text-navy-800">Location</h2>
                    <p className="flex items-center gap-1 text-ink-secondary">
                      <MapPin className="h-4 w-4" /> {project.address_full}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar: project facts */}
              <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                  <h2 className="mb-4 text-lg font-semibold text-navy-800">Project Details</h2>
                  <dl className="space-y-3 text-sm">
                    {project.rera_number && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">RERA No.</dt>
                        <dd className="font-medium text-navy-800">{project.rera_number}</dd>
                      </div>
                    )}
                    {project.total_units != null && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Total Units</dt>
                        <dd className="font-medium text-navy-800">{project.total_units}</dd>
                      </div>
                    )}
                    {project.available_units != null && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Available</dt>
                        <dd className="font-medium text-navy-800">{project.available_units}</dd>
                      </div>
                    )}
                    {project.launch_date && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Launched</dt>
                        <dd className="font-medium text-navy-800">{formatDate(project.launch_date)}</dd>
                      </div>
                    )}
                    {project.possession_date && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Possession</dt>
                        <dd className="font-medium text-navy-800">{formatDate(project.possession_date)}</dd>
                      </div>
                    )}
                  </dl>
                  {project.brochure_path && (
                    <Link
                      to={ROUTES.contact}
                      className="mt-4 flex items-center justify-center gap-2 rounded-md border border-navy-600 px-4 py-2 text-sm font-semibold text-navy-600 hover:bg-navy-50"
                    >
                      <FileText className="h-4 w-4" /> Request Brochure
                    </Link>
                  )}
                  <Link
                    to={ROUTES.contact}
                    className="mt-3 flex items-center justify-center gap-2 rounded-md bg-gold-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gold-700"
                  >
                    Enquire Now
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </>
      )}
    </QueryBoundary>
  );
}
