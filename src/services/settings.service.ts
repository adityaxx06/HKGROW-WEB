/**
 * Settings & Content Blocks service.
 *
 * All Supabase calls for website_settings and content_blocks live here.
 * React Query hooks consume these functions — nothing else calls supabase
 * directly for this domain.
 */

import { supabase } from '@/lib/supabase';
import type { WebsiteSettings, ContentBlock } from '@/types/database';

// ── website_settings ──────────────────────────────────────────────────────────

export async function fetchSettings(): Promise<WebsiteSettings> {
  const { data, error } = await supabase
    .from('website_settings')
    .select('*')
    .eq('id', 'singleton')
    .single();

  if (error) throw error;
  return data as WebsiteSettings;
}

export async function updateSettings(
  patch: Partial<Omit<WebsiteSettings, 'id' | 'updated_at'>>
): Promise<WebsiteSettings> {
  const { data, error } = await supabase
    .from('website_settings')
    .update(patch)
    .eq('id', 'singleton')
    .select()
    .single();

  if (error) throw error;
  return data as WebsiteSettings;
}

// ── content_blocks ────────────────────────────────────────────────────────────

export async function fetchContentBlocksByPage(page: string): Promise<ContentBlock[]> {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('page', page)
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return (data ?? []) as ContentBlock[];
}

export async function fetchContentBlockByKey(sectionKey: string): Promise<ContentBlock | null> {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('section_key', sectionKey)
    .maybeSingle();

  if (error) throw error;
  return data as ContentBlock | null;
}

/** Admin: fetch all blocks for a page, including inactive */
export async function fetchAllContentBlocksByPage(page: string): Promise<ContentBlock[]> {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('page', page)
    .order('sort_order');

  if (error) throw error;
  return (data ?? []) as ContentBlock[];
}

export async function updateContentBlock(
  id: string,
  patch: { content?: Record<string, unknown>; is_active?: boolean; sort_order?: number }
): Promise<ContentBlock> {
  const { data, error } = await supabase
    .from('content_blocks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ContentBlock;
}
