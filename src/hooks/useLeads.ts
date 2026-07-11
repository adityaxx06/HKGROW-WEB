import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchLeads, fetchLeadById, fetchDashboardStats,
  fetchSourceAnalytics, updateLead, archiveLead,
  type LeadFilters,
} from '@/services/leads.service';
import type { Lead } from '@/types/database';

export function useLeads(filters: LeadFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.list(filters),
    queryFn: () => fetchLeads(filters),
    staleTime: STALE.admin,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.leads.detail(id),
    queryFn: () => fetchLeadById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard.stats(),
    queryFn: fetchDashboardStats,
    staleTime: STALE.stats,
    refetchInterval: STALE.stats,
  });
}

export function useSourceAnalytics() {
  return useQuery({
    queryKey: QUERY_KEYS.leads.sourceAnalytics(),
    queryFn: fetchSourceAnalytics,
    staleTime: STALE.admin,
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Lead, 'stage' | 'priority' | 'assigned_to' | 'admin_notes' | 'follow_up_date' | 'tags' | 'is_archived'>>;
    }) => updateLead(id, patch),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.leads.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.leads.detail(id) });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats() });
    },
  });
}

export function useArchiveLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveLead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.leads.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.stats() });
    },
  });
}
