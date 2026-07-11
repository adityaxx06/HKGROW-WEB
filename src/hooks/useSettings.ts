import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import { fetchSettings, updateSettings, fetchContentBlocksByPage, fetchContentBlockByKey, fetchAllContentBlocksByPage, updateContentBlock } from '@/services/settings.service';
import type { WebsiteSettings } from '@/types/database';

// ── website_settings ──────────────────────────────────────────────────────────

export function useSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.settings.singleton(),
    queryFn: fetchSettings,
    staleTime: STALE.static,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Omit<WebsiteSettings, 'id' | 'updated_at'>>) =>
      updateSettings(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.settings.all });
    },
  });
}

// ── content_blocks ────────────────────────────────────────────────────────────

export function useContentBlocks(page: string) {
  return useQuery({
    queryKey: QUERY_KEYS.contentBlocks.byPage(page),
    queryFn: () => fetchContentBlocksByPage(page),
    staleTime: STALE.static,
  });
}

export function useContentBlock(sectionKey: string) {
  return useQuery({
    queryKey: QUERY_KEYS.contentBlocks.byKey(sectionKey),
    queryFn: () => fetchContentBlockByKey(sectionKey),
    staleTime: STALE.static,
  });
}

export function useAdminContentBlocks(page: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.contentBlocks.byPage(page), 'admin'],
    queryFn: () => fetchAllContentBlocksByPage(page),
    staleTime: STALE.admin,
  });
}

export function useUpdateContentBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { content?: Record<string, unknown>; is_active?: boolean; sort_order?: number };
    }) => updateContentBlock(id, patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.contentBlocks.all });
    },
  });
}
