/**
 * Properties service.
 *
 * Public queries use the `properties_public` view (RLS: active/sold/coming_soon).
 * Admin queries use the `properties_admin` view or direct table (includes drafts/deleted).
 */

import { supabase } from '@/lib/supabase';
import type { PropertyPublic, Property } from '@/types/database';

// ── Public filters ────────────────────────────────────────────────────────────

export interface PropertyFilters {
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  locationArea?: string;
  possessionStatus?: string;
  status?: 'active' | 'sold' | 'coming_soon';
  projectId?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function fetchPublicProperties(
  filters: PropertyFilters = {}
): Promise<{ data: PropertyPublic[]; count: number }> {
  const {
    categorySlug,
    minPrice,
    maxPrice,
    bedrooms,
    locationArea,
    possessionStatus,
    status,
    projectId,
    featured,
    search,
    page = 1,
    pageSize = 12,
  } = filters;

  let query = supabase
    .from('properties_public')
    .select('*', { count: 'exact' });

  if (categorySlug)    query = query.eq('category_slug', categorySlug);
  if (minPrice)        query = query.gte('price_amount', minPrice);
  if (maxPrice)        query = query.lte('price_amount', maxPrice);
  if (bedrooms)        query = query.eq('bedrooms', bedrooms);
  if (locationArea)    query = query.ilike('location_area', `%${locationArea}%`);
  if (possessionStatus) query = query.eq('possession_status', possessionStatus);
  if (status)          query = query.eq('status', status);
  if (projectId)       query = query.eq('project_id', projectId);
  if (featured)        query = query.eq('is_featured', true);
  if (search) {
    query = query.textSearch('search_vector', search, {
      type: 'websearch',
      config: 'english',
    });
  }

  const from = (page - 1) * pageSize;
  query = query.order('sort_order').range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as PropertyPublic[], count: count ?? 0 };
}

export async function fetchPublicPropertyBySlug(slug: string): Promise<PropertyPublic | null> {
  const { data, error } = await supabase
    .from('properties_public')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as PropertyPublic | null;
}

export async function fetchFeaturedProperties(limit = 6): Promise<PropertyPublic[]> {
  const { data, error } = await supabase
    .from('properties_public')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .order('sort_order')
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PropertyPublic[];
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminPropertyFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export async function fetchAdminProperties(
  filters: AdminPropertyFilters = {}
): Promise<{ data: Property[]; count: number }> {
  const { status, search, page = 1, pageSize = 20, includeDeleted = false } = filters;

  let query = supabase
    .from('properties')
    .select('*, property_categories(name, slug), projects(title, slug)', { count: 'exact' });

  if (!includeDeleted) query = query.is('deleted_at', null);
  if (status)          query = query.eq('status', status);
  if (search)          query = query.ilike('title', `%${search}%`);

  const from = (page - 1) * pageSize;
  query = query.order('sort_order').range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Property[], count: count ?? 0 };
}

export async function fetchAdminPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Property | null;
}

export async function createProperty(
  payload: Omit<Partial<Property>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>
): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

export async function updateProperty(
  id: string,
  patch: Omit<Partial<Property>, 'id' | 'created_at' | 'search_vector'>
): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

/** Soft delete — sets deleted_at = NOW() */
export async function softDeleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

/** Update sort_order for multiple properties in a single call */
export async function reorderProperties(
  updates: { id: string; sort_order: number }[]
): Promise<void> {
  const { error } = await supabase.from('properties').upsert(updates, { onConflict: 'id' });
  if (error) throw error;
}
