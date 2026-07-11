import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, Compass, Calendar, CheckCircle2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicProperty } from '@/hooks/useProperties';
import { useSettings } from '@/hooks/useSettings';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge } from '@/components/ui/Badge';
import { ContactForm } from '@/components/forms/ContactForm';
import { FadeInWhenVisible } from '@/components/shared/Motion';
import { imageUrl } from '@/lib/imageUrl';
import { buildPropertySchema, buildBreadcrumbSchema } from '@/utils/seo';
import { formatArea, bedroomLabel, buildWhatsAppUrl } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes';
import { env } from '@/lib/env';

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: property, isLoading, error, refetch } = usePublicProperty(slug ?? '');
  const { data: settings } = useSettings();
  const [activeImage, setActiveImage] = useState(0);

  const sortedImages = property?.images ? [...property.images].sort((a, b) => a.sort - b.sort) : [];

  return (
    <QueryBoundary
      isLoading={isLoading} error={error} onRetry={refetch}
      isEmpty={!property && !isLoading}
      emptyMessage="Property not found. It may have been sold or removed."
      verbose
    >
      {property && (
        <>
          <PageMeta
            title={property.seo_title ?? `${property.title} | HK Grow Infra`}
            description={property.seo_description ?? property.excerpt ?? `${property.title} for sale in ${property.location_area ?? 'Prayagraj'}.`}
            ogImagePath={property.seo_og_image_path ?? sortedImages[0]?.path}
            canonicalPath={`/properties/${property.slug}`}
            schema={[
              buildPropertySchema(property, env.SITE_URL),
              buildBreadcrumbSchema([
                { name: 'Home', url: env.SITE_URL },
                { name: 'Properties', url: `${env.SITE_URL}/properties` },
                { name: property.title, url: `${env.SITE_URL}/properties/${property.slug}` },
              ]),
            ]}
          />

          <div className="container-page py-10">
            {/* Breadcrumb */}
            <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink-secondary">
              <Link to={ROUTES.home} className="hover:text-navy-600">Home</Link>
              <span>/</span>
              <Link to={ROUTES.properties.list} className="hover:text-navy-600">Properties</Link>
              <span>/</span>
              <span className="text-ink-primary truncate">{property.title}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
              <div className="min-w-0">
                {/* Image gallery */}
                {sortedImages.length > 0 && (
                  <div className="mb-8">
                    {/* ── Main image — shows complete image, no crop ── */}
                    <div className="relative overflow-hidden rounded-2xl bg-navy-50 shadow-card-lg">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeImage}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="flex items-center justify-center bg-navy-50"
                        >
                          <img
                            src={imageUrl(sortedImages[activeImage]?.path, 'detail')}
                            alt={sortedImages[activeImage]?.alt || property.title}
                            loading={activeImage === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="max-h-[60vh] w-full object-contain sm:max-h-[460px] lg:max-h-[520px]"
                            style={{ display: 'block' }}
                          />
                        </motion.div>
                      </AnimatePresence>
                      {property.status !== 'active' && (
                        <Badge tone={property.status === 'sold' ? 'red' : 'amber'} className="absolute top-4 left-4">
                          {property.status === 'sold' ? 'Sold' : 'Coming Soon'}
                        </Badge>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {sortedImages.length > 1 && (
                      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                        {sortedImages.map((img, i) => (
                          <button
                            key={img.path}
                            onClick={() => setActiveImage(i)}
                            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${i === activeImage ? 'border-navy-600 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          >
                            <img src={imageUrl(img.path, 'thumb')} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Title and key facts */}
                <FadeInWhenVisible className="mb-6">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge tone="navy">{property.category_name}</Badge>
                    {property.is_verified && <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>}
                  </div>
                  <h1 className="break-words text-2xl font-extrabold text-navy-800 sm:text-3xl">{property.title}</h1>
                  <p className="mt-2 flex items-start gap-1 text-ink-secondary">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="break-words">{[property.address_full, property.location_area, property.location_city].filter(Boolean).join(', ')}</span>
                  </p>
                  <p className="mt-3 break-words text-2xl font-extrabold text-navy-700 sm:text-3xl">
                    {property.price_label}
                    {property.price_per_sqft && (
                      <span className="ml-2 text-sm font-normal text-ink-secondary">
                        (₹{property.price_per_sqft.toLocaleString('en-IN')}/sq ft)
                      </span>
                    )}
                  </p>
                </FadeInWhenVisible>

                {/* Quick facts grid */}
                <FadeInWhenVisible className="mb-6">
                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-card sm:gap-4 sm:p-5 sm:grid-cols-4">
                    {property.bedrooms != null && (
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                          <BedDouble className="h-5 w-5 text-navy-500" />
                        </div>
                        <p className="text-sm font-bold text-navy-800">{bedroomLabel(property.bedrooms)}</p>
                        <p className="text-xs text-ink-secondary">Bedrooms</p>
                      </div>
                    )}
                    {property.bathrooms != null && (
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                          <Bath className="h-5 w-5 text-navy-500" />
                        </div>
                        <p className="text-sm font-bold text-navy-800">{property.bathrooms}</p>
                        <p className="text-xs text-ink-secondary">Bathrooms</p>
                      </div>
                    )}
                    {property.area_sqft != null && (
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                          <Maximize className="h-5 w-5 text-navy-500" />
                        </div>
                        <p className="text-sm font-bold text-navy-800">{formatArea(property.area_sqft)}</p>
                        <p className="text-xs text-ink-secondary">Area</p>
                      </div>
                    )}
                    {property.facing && (
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                          <Compass className="h-5 w-5 text-navy-500" />
                        </div>
                        <p className="text-sm font-bold text-navy-800">{property.facing}</p>
                        <p className="text-xs text-ink-secondary">Facing</p>
                      </div>
                    )}
                  </div>
                </FadeInWhenVisible>

                {/* Description */}
                {property.description && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-semibold text-navy-800">About this property</h2>
                    <p className="text-ink-secondary whitespace-pre-line">{property.description}</p>
                  </div>
                )}

                {/* Possession + furnishing */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  {property.possession_status && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs text-ink-secondary">Possession</p>
                      <p className="mt-1 flex items-center gap-1 font-medium text-navy-800">
                        <Calendar className="h-4 w-4" /> {property.possession_status}
                      </p>
                    </div>
                  )}
                  {property.furnishing_status && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs text-ink-secondary">Furnishing</p>
                      <p className="mt-1 font-medium text-navy-800">{property.furnishing_status}</p>
                    </div>
                  )}
                  {property.floor_number != null && property.total_floors != null && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="text-xs text-ink-secondary">Floor</p>
                      <p className="mt-1 font-medium text-navy-800">{property.floor_number} of {property.total_floors}</p>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {property.amenities.length > 0 && (
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-semibold text-navy-800">Amenities</h2>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {property.amenities.map((a) => (
                        <div key={a} className="flex items-center gap-2 text-sm text-ink-secondary">
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Project link */}
                {property.project_title && property.project_slug && (
                  <div className="mb-6 rounded-lg border border-navy-100 bg-navy-50 p-4">
                    <p className="text-sm text-ink-secondary">Part of the project</p>
                    <Link to={ROUTES.projects.detail(property.project_slug)} className="font-semibold text-navy-700 hover:underline">
                      {property.project_title} →
                    </Link>
                  </div>
                )}

                {/* Map */}
                {property.map_embed_url && (
                  <FadeInWhenVisible className="mb-6">
                    <h2 className="mb-3 text-xl font-bold text-navy-800">Location</h2>
                    <div className="map-embed-wrap overflow-hidden rounded-2xl border border-gray-200 shadow-card">
                      {property.map_embed_url.trim().startsWith('<') ? (
                        /* Full iframe HTML pasted by admin — inline width/height attrs are
                           overridden via !important in index.css (.map-embed-wrap iframe) */
                        <div dangerouslySetInnerHTML={{ __html: property.map_embed_url }} />
                      ) : (
                        /* Bare src URL pasted by admin */
                        <iframe
                          src={property.map_embed_url}
                          title="Property Location Map"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      )}
                    </div>
                  </FadeInWhenVisible>
                )}
              </div>

              {/* Sticky inquiry sidebar */}
              <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
                  <h2 className="mb-4 text-lg font-semibold text-navy-800">Interested in this property?</h2>
                  {settings?.whatsapp_number && (
                    <a
                      href={buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_greeting ?? '', property.title)}
                      target="_blank"
                      rel="noreferrer"
                      className="mb-4 flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2.5 font-semibold text-white hover:bg-green-600"
                    >
                      <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                    </a>
                  )}
                  <ContactForm
                    source="property_inquiry"
                    propertyId={property.id}
                    defaultMessage={`I'm interested in "${property.title}". Please share more details.`}
                  />
                </div>
              </aside>
            </div>
          </div>
        </>
      )}
    </QueryBoundary>
  );
}
