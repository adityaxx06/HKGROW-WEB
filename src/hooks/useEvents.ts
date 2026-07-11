import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchUpcomingEvents, fetchPastEvents, fetchPublicEventBySlug,
  fetchAdminEvents, fetchAdminEventById,
  createEvent, updateEvent, softDeleteEvent,
} from '@/services/events.service';
import type { EventItem } from '@/types/database';

export function useUpcomingEvents(limit = 9) {
  return useQuery({
    queryKey: QUERY_KEYS.events.upcoming(),
    queryFn: () => fetchUpcomingEvents(limit),
    staleTime: STALE.listings,
  });
}

export function usePastEvents(limit = 9) {
  return useQuery({
    queryKey: QUERY_KEYS.events.past(),
    queryFn: () => fetchPastEvents(limit),
    staleTime: STALE.listings,
  });
}

export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.events.detail(slug),
    queryFn: () => fetchPublicEventBySlug(slug),
    staleTime: STALE.listings,
    enabled: !!slug,
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: QUERY_KEYS.events.adminList(),
    queryFn: fetchAdminEvents,
    staleTime: STALE.admin,
  });
}

export function useAdminEvent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.events.adminDetail(id),
    queryFn: () => fetchAdminEventById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<EventItem>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>) =>
      createEvent(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.events.all }); },
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<EventItem>, 'id' | 'created_at' | 'search_vector'> }) =>
      updateEvent(id, patch),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.events.adminDetail(id) });
    },
  });
}

export function useSoftDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteEvent(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.events.all }); },
  });
}
