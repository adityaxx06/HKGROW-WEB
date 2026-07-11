import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchFeaturedTestimonials, fetchAllTestimonials,
  fetchAdminTestimonials, createTestimonial,
  updateTestimonial, hardDeleteTestimonial,
} from '@/services/testimonials.service';
import type { Testimonial } from '@/types/database';

export function useFeaturedTestimonials(limit = 6) {
  return useQuery({
    queryKey: QUERY_KEYS.testimonials.featured(),
    queryFn: () => fetchFeaturedTestimonials(limit),
    staleTime: STALE.static,
  });
}

export function useAllTestimonials() {
  return useQuery({
    queryKey: QUERY_KEYS.testimonials.list(),
    queryFn: fetchAllTestimonials,
    staleTime: STALE.listings,
  });
}

export function useAdminTestimonials() {
  return useQuery({
    queryKey: QUERY_KEYS.testimonials.adminList(),
    queryFn: fetchAdminTestimonials,
    staleTime: STALE.admin,
  });
}

export function useCreateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<Testimonial>, 'id' | 'created_at' | 'updated_at'>) =>
      createTestimonial(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.testimonials.all }); },
  });
}

export function useUpdateTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<Testimonial>, 'id' | 'created_at'> }) =>
      updateTestimonial(id, patch),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.testimonials.all }); },
  });
}

export function useHardDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hardDeleteTestimonial(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.testimonials.all }); },
  });
}
