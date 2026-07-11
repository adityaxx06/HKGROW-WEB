/**
 * Blog hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchPublicPosts, fetchPublicPostBySlug, fetchLatestPosts,
  fetchAdminPosts, fetchAdminPostById,
  createPost, updatePost, softDeletePost,
  type BlogFilters, type AdminBlogFilters,
} from '@/services/blog.service';
import type { BlogPost } from '@/types/database';

export function usePublicPosts(filters: BlogFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.blog.list(filters),
    queryFn: () => fetchPublicPosts(filters),
    staleTime: STALE.listings,
  });
}

export function usePublicPost(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blog.detail(slug),
    queryFn: () => fetchPublicPostBySlug(slug),
    staleTime: STALE.listings,
    enabled: !!slug,
  });
}

export function useLatestPosts(limit = 3) {
  return useQuery({
    queryKey: QUERY_KEYS.blog.latest(limit),
    queryFn: () => fetchLatestPosts(limit),
    staleTime: STALE.listings,
  });
}

export function useAdminPosts(filters: AdminBlogFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.blog.adminList(filters),
    queryFn: () => fetchAdminPosts(filters),
    staleTime: STALE.admin,
  });
}

export function useAdminPost(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blog.adminDetail(id),
    queryFn: () => fetchAdminPostById(id),
    staleTime: STALE.admin,
    enabled: !!id,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<BlogPost>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>) =>
      createPost(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.blog.all }); },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Omit<Partial<BlogPost>, 'id' | 'created_at' | 'search_vector'> }) =>
      updatePost(id, patch),
    onSuccess: (_d, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.blog.all });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.blog.adminDetail(id) });
    },
  });
}

export function useSoftDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => softDeletePost(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.blog.all }); },
  });
}
