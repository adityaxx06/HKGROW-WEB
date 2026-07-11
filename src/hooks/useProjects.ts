import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchPublicProjects, fetchPublicProjectBySlug, fetchFeaturedProjects,
  fetchAdminProjects, fetchAdminProjectById,
  createProject, updateProject, softDeleteProject,
} from '@/services/projects.service';
import type { Project } from '@/types/database';

export function usePublicProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.projects.list(),
    queryFn: fetchPublicProjects,
    staleTime: STALE.listings,
  });
}

export function usePublicProject(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.detail(slug),
    queryFn: () => fetchPublicProjectBySlug(slug),
    staleTime: STALE.listings,
    enabled: !!slug,
  });
}

export function useFeaturedProjects(limit = 3) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.featured(),
    queryFn: () => fetchFeaturedProjects(limit),
    staleTime: STALE.listings,
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.projects.adminList(),
    queryFn: fetchAdminProjects,
    staleTime: STALE.admin,
  });
}

export function useAdminProject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.projects.adminDetail(id),
    queryFn: () => fetchAdminProjectById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<Project>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>) =>
      createProject(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.all }); },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<Project>, 'id' | 'created_at' | 'search_vector'> }) =>
      updateProject(id, patch),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.adminDetail(id) });
    },
  });
}

export function useSoftDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeleteProject(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.projects.all }); },
  });
}
