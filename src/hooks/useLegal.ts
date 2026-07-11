import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { STALE } from '@/constants/ui';
import {
  fetchPublishedLegalPage, fetchAdminLegalPages,
  fetchLegalPageHistory, createLegalPageVersion,
  publishLegalPage, updateLegalPageDraft, deleteLegalPageDraft,
} from '@/services/legal.service';
import type { LegalPage, LegalPageKey } from '@/types/database';

export function usePublishedLegalPage(key: LegalPageKey) {
  return useQuery({
    queryKey: QUERY_KEYS.legal.byKey(key),
    queryFn: () => fetchPublishedLegalPage(key),
    staleTime: STALE.static,
  });
}

export function useAdminLegalPages() {
  return useQuery({
    queryKey: QUERY_KEYS.legal.adminList(),
    queryFn: fetchAdminLegalPages,
    staleTime: STALE.admin,
  });
}

export function useLegalPageHistory(key: LegalPageKey) {
  return useQuery({
    queryKey: QUERY_KEYS.legal.adminHistory(key),
    queryFn: () => fetchLegalPageHistory(key),
    staleTime: STALE.admin,
  });
}

export function useCreateLegalPageVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Partial<LegalPage>, 'id' | 'created_at' | 'updated_at'>) =>
      createLegalPageVersion(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.legal.all }); },
  });
}

export function usePublishLegalPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, key }: { id: string; key: LegalPageKey }) =>
      publishLegalPage(id, key),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.legal.all }); },
  });
}

export function useUpdateLegalPageDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, patch,
    }: {
      id: string;
      patch: Pick<Partial<LegalPage>, 'title' | 'content' | 'change_summary'>;
    }) => updateLegalPageDraft(id, patch),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.legal.all }); },
  });
}

export function useDeleteLegalPageDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLegalPageDraft(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: QUERY_KEYS.legal.all }); },
  });
}
