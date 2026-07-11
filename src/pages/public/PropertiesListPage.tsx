import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { usePublicProperties } from '@/hooks/useProperties';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { Pagination } from '@/components/shared/Pagination';
import { PageMeta } from '@/components/ui/PageMeta';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getHeroImage } from '@/lib/imageUrl';
import { PropertyImage } from '@/components/shared/PropertyImage';
import { StaggerContainer, StaggerItem } from '@/components/shared/Motion';
import { PAGE_SIZES, BEDROOM_OPTIONS, POSSESSION_OPTIONS, PRICE_RANGE_OPTIONS } from '@/constants/ui';
import { ROUTES } from '@/constants/routes';

export function PropertiesListPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page             = Number(params.get('page') ?? 1);
  const categorySlug     = params.get('category') ?? undefined;
  const bedrooms         = params.get('bedrooms') ? Number(params.get('bedrooms')) : undefined;
  const possessionStatus = params.get('possession') ?? undefined;
  const priceIndex       = params.get('price') ? Number(params.get('price')) : undefined;
  const priceRange       = priceIndex != null ? PRICE_RANGE_OPTIONS[priceIndex] : undefined;

  const { data: categories } = useQuery({
    queryKey: QUERY_KEYS.categories.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data, isLoading, error, refetch } = usePublicProperties({
    categorySlug,
    bedrooms,
    possessionStatus,
    minPrice: priceRange?.min ?? undefined,
    maxPrice: priceRange?.max ?? undefined,
    status: 'active',
    page,
    pageSize: PAGE_SIZES.properties,
  });

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  }

  function setPage(p: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  }

  const activeFilterCount = [categorySlug, bedrooms, possessionStatus, priceIndex].filter((v) => v != null).length;

  return (
    <>
      <PageMeta
        title="Properties for Sale in Prayagraj | HK Grow Infra"
        description="Browse RERA-registered flats, villas, plots, and commercial spaces for sale in Civil Lines, Naini, and across Prayagraj."
        canonicalPath="/properties"
      />

      <div className="container-page py-16 lg:py-20">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="eyebrow mb-3">Listings</p>
            <h1 className="font-display text-3xl font-medium text-navy-800 lg:text-4xl">Properties</h1>
            <p className="mt-2 text-ink-secondary">{data ? `${data.count} properties available` : 'Browse our listings'}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Filters sidebar */}
          <aside className={`space-y-6 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-semibold text-navy-800">Filters</h2>
              <button onClick={() => setFiltersOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-navy-800">Category</h3>
              <div className="space-y-1.5">
                {categories?.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={categorySlug === c.slug}
                      onChange={() => updateParam('category', c.slug)}
                      className="accent-navy-600"
                    />
                    {c.name}
                  </label>
                ))}
                {categorySlug && (
                  <button onClick={() => updateParam('category', undefined)} className="text-xs text-navy-600 hover:underline">
                    Clear category
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-navy-800">Bedrooms</h3>
              <div className="flex flex-wrap gap-2">
                {BEDROOM_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => updateParam('bedrooms', bedrooms === b ? undefined : String(b))}
                    className={`rounded-md border px-3 py-1.5 text-sm ${bedrooms === b ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-gray-300 text-ink-secondary hover:border-navy-400'}`}
                  >
                    {b} BHK
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-navy-800">Price Range</h3>
              <div className="space-y-1.5">
                {PRICE_RANGE_OPTIONS.map((range, i) => (
                  <label key={range.label} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={priceIndex === i}
                      onChange={() => updateParam('price', String(i))}
                      className="accent-navy-600"
                    />
                    {range.label}
                  </label>
                ))}
                {priceIndex != null && (
                  <button onClick={() => updateParam('price', undefined)} className="text-xs text-navy-600 hover:underline">
                    Clear price
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-navy-800">Possession</h3>
              <div className="space-y-1.5">
                {POSSESSION_OPTIONS.map((p) => (
                  <label key={p} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      checked={possessionStatus === p}
                      onChange={() => updateParam('possession', p)}
                      className="accent-navy-600"
                    />
                    {p}
                  </label>
                ))}
                {possessionStatus && (
                  <button onClick={() => updateParam('possession', undefined)} className="text-xs text-navy-600 hover:underline">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <QueryBoundary
              isLoading={isLoading} error={error} onRetry={refetch}
              isEmpty={data?.data.length === 0}
              emptyMessage="No properties match your filters. Try adjusting your search."
              loadingVariant="skeleton-cards" skeletonCount={6} verbose
            >
              <StaggerContainer className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {data?.data.map((p) => {
                  const hero = getHeroImage(p.images);
                  return (
                    <StaggerItem key={p.id}>
                      <Link to={ROUTES.properties.detail(p.slug)} className="group flex flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-card transition-all duration-500 hover:shadow-card-lg sm:hover:-translate-y-1">
                        <div className="relative overflow-hidden">
                          <PropertyImage
                            path={hero?.path}
                            alt={hero?.alt ?? p.title}
                            size="card"
                            aspect="4/3"
                            imgClassName="transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 flex gap-1.5">
                            {p.is_featured && <Badge tone="gold">Featured</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">{p.category_name}</p>
                          <h3 className="mt-2 font-display text-lg font-medium text-navy-800 group-hover:text-navy-600 transition-colors duration-300 truncate">{p.title}</h3>
                          <p className="mt-1.5 text-sm text-ink-secondary truncate">{[p.location_area, p.location_city].filter(Boolean).join(', ')}</p>
                          <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100">
                            <span className="font-display text-xl font-medium text-navy-700">{p.price_label}</span>
                            {p.bedrooms != null && <span className="rounded-sm bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-600">{p.bedrooms} BHK</span>}
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              <div className="mt-10">
                <Pagination page={page} pageSize={PAGE_SIZES.properties} totalCount={data?.count ?? 0} onPageChange={setPage} />
              </div>
            </QueryBoundary>
          </div>
        </div>
      </div>
    </>
  );
}
