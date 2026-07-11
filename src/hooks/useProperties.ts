import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchPublicProperties, fetchPublicPropertyBySlug, fetchFeaturedProperties,
  fetchAdminProperties, fetchAdminPropertyById,
  createProperty, updateProperty, softDeleteProperty, reorderProperties,
  type PropertyFilters, type AdminPropertyFilters,
} from '@/services/properties.service';
import type { Property } from '@/types/database';

// ── Public ────────────────────────────────────────────────────────────────────

export function usePublicProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.properties.list(filters),
    queryFn: () => fetchPublicProperties(filters),
    staleTime: STALE.listings,
  });
}

export function usePublicProperty(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.properties.detail(slug),
    queryFn: () => fetchPublicPropertyBySlug(slug),
    staleTime: STALE.listings,
    enabled: !!slug,
  });
}

export function useFeaturedProperties(limit = 6) {
  return useQuery({
    queryKey: QUERY_KEYS.properties.featured(),
    queryFn: () => fetchFeaturedProperties(limit),
    staleTime: STALE.listings,
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useAdminProperties(filters: AdminPropertyFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.properties.adminList(filters),
    queryFn: () => fetchAdminProperties(filters),
    staleTime: STALE.admin,
  });
}

export function useAdminProperty(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.properties.adminDetail(id),
    queryFn: () => fetchAdminPropertyById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<Property>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>) =>
      createProperty(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.properties.all });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<Property>, 'id' | 'created_at' | 'search_vector'> }) =>
      updateProperty(id, patch),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.properties.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.properties.adminDetail(id) });
    },
  });
}

export function useSoftDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteProperty(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.properties.all });
    },
  });
}

export function useReorderProperties() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; sort_order: number }[]) => reorderProperties(updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.properties.all });
    },
  });
}
