import { supabase } from '@/lib/supabase';
import type { LegalPage, LegalPageKey } from '@/types/database';

export async function fetchPublishedLegalPage(key: LegalPageKey): Promise<LegalPage | null> {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('page_key', key)
    .eq('status', 'published')
    .maybeSingle();

  if (error) throw error;
  return data as LegalPage | null;
}

export async function fetchAdminLegalPages(): Promise<LegalPage[]> {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .order('page_key')
    .order('version', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LegalPage[];
}

export async function fetchLegalPageHistory(key: LegalPageKey): Promise<LegalPage[]> {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('page_key', key)
    .order('version', { ascending: false });

  if (error) throw error;
  return (data ?? []) as LegalPage[];
}

export async function createLegalPageVersion(
  payload: Omit<Partial<LegalPage>, 'id' | 'created_at' | 'updated_at'>
): Promise<LegalPage> {
  const { data, error } = await supabase
    .from('legal_pages')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as LegalPage;
}

/**
 * Publish a legal page version:
 * 1. Archive the currently published version for this page_key
 * 2. Set the target version to 'published'
 *
 * Must be called in sequence — no transaction support in supabase-js client,
 * so these are two separate mutations. If step 2 fails, step 1 has already
 * run (archived but no published). Acceptable for a low-traffic admin action;
 * admin can re-publish manually from the history list.
 */
export async function publishLegalPage(id: string, key: LegalPageKey): Promise<void> {
  // Step 1: archive current published version (if any)
  await supabase
    .from('legal_pages')
    .update({ status: 'archived' })
    .eq('page_key', key)
    .eq('status', 'published');

  // Step 2: publish the target version
  const { error } = await supabase
    .from('legal_pages')
    .update({ status: 'published', effective_date: new Date().toISOString().slice(0, 10) })
    .eq('id', id);

  if (error) throw error;
}

export async function updateLegalPageDraft(
  id: string,
  patch: Pick<Partial<LegalPage>, 'title' | 'content' | 'change_summary'>
): Promise<LegalPage> {
  const { data, error } = await supabase
    .from('legal_pages')
    .update(patch)
    .eq('id', id)
    .eq('status', 'draft') // guard: only drafts are editable
    .select()
    .single();

  if (error) throw error;
  return data as LegalPage;
}

export async function deleteLegalPageDraft(id: string): Promise<void> {
  const { error } = await supabase
    .from('legal_pages')
    .delete()
    .eq('id', id)
    .eq('status', 'draft'); // DB policy also enforces this; double guard here

  if (error) throw error;
}
