import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchPublicTeamMembers, fetchAdminTeamMembers, fetchAdminTeamMemberById,
  createTeamMember, updateTeamMember, softDeleteTeamMember, reorderTeamMembers,
} from '@/services/team.service';
import type { TeamMember } from '@/types/database';

export function usePublicTeamMembers() {
  return useQuery({
    queryKey: QUERY_KEYS.team.list(),
    queryFn: fetchPublicTeamMembers,
    staleTime: STALE.static,
  });
}

export function useAdminTeamMembers() {
  return useQuery({
    queryKey: QUERY_KEYS.team.adminList(),
    queryFn: fetchAdminTeamMembers,
    staleTime: STALE.admin,
  });
}

export function useAdminTeamMember(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.team.adminDetail(id),
    queryFn: () => fetchAdminTeamMemberById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<TeamMember>, 'id' | 'created_at' | 'updated_at'>) =>
      createTeamMember(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all }); },
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<TeamMember>, 'id' | 'created_at'> }) =>
      updateTeamMember(id, patch),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.team.adminDetail(id) });
    },
  });
}

export function useSoftDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteTeamMember(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all }); },
  });
}

export function useReorderTeamMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; rank_order: number }[]) => reorderTeamMembers(updates),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all }); },
  });
}
