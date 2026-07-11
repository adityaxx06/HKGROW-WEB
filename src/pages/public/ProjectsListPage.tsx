import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { usePublicProjects } from '@/hooks/useProjects';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { getHeroImage } from '@/lib/imageUrl';
import { PropertyImage } from '@/components/shared/PropertyImage';
import { StaggerContainer, StaggerItem, FadeInWhenVisible } from '@/components/shared/Motion';
import { PROJECT_STATUS_LABELS } from '@/constants/ui';
import { ROUTES } from '@/constants/routes';

export function ProjectsListPage() {
  const { data: projects, isLoading, error, refetch } = usePublicProjects();

  return (
    <>
      <PageMeta
        title="Our Projects in Prayagraj | HK Grow Infra"
        description="Explore RERA-registered residential and commercial projects by HK Grow Infra across Civil Lines, Naini, and Prayagraj."
        canonicalPath="/projects"
      />

      <div className="container-page py-16 lg:py-20">
        <FadeInWhenVisible>
          <p className="eyebrow mb-3">RERA Registered</p>
          <h1 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">Our Projects</h1>
          <p className="mt-3 text-ink-secondary">RERA-registered developments across Prayagraj's growing neighbourhoods</p>
        </FadeInWhenVisible>

        <QueryBoundary
          isLoading={isLoading} error={error} onRetry={refetch}
          isEmpty={projects?.length === 0}
          emptyMessage="No projects to display right now."
          loadingVariant="skeleton-cards" skeletonCount={3} verbose
        >
          <StaggerContainer className="mt-12 grid gap-8 lg:grid-cols-2">
            {projects?.map((project) => {
              const hero = getHeroImage(project.images);
              return (
                <StaggerItem key={project.id}>
                  <Link
                    to={ROUTES.projects.detail(project.slug)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-card transition-all duration-500 hover:shadow-card-lg sm:hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden">
                      <PropertyImage
                        path={hero?.path}
                        alt={hero?.alt ?? project.title}
                        size="detail"
                        aspect="16/9"
                        imgClassName="transition-transform duration-700 group-hover:scale-105"
                      />
                      <Badge tone={statusToTone(project.status)} className="absolute top-4 left-4">
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col p-7">
                      <h2 className="font-display text-xl font-medium text-navy-800 group-hover:text-navy-600 transition-colors duration-300">{project.title}</h2>
                      {project.subtitle && <p className="mt-1.5 text-sm text-ink-secondary">{project.subtitle}</p>}
                      <p className="mt-2.5 flex items-center gap-1 text-sm text-ink-secondary">
                        <MapPin className="h-4 w-4 shrink-0" /> {[project.location_area, project.location_city].filter(Boolean).join(', ')}
                      </p>
                      {project.highlights.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.highlights.slice(0, 4).map((h) => (
                            <span key={h} className="rounded-sm bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-600">{h}</span>
                          ))}
                        </div>
                      )}
                      {project.total_units != null && (
                        <p className="mt-4 text-sm text-ink-secondary">
                          {project.available_units} of {project.total_units} units available
                        </p>
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
    </>
  );
}
