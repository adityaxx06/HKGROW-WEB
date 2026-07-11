import { supabase } from '@/lib/supabase';
import type { EventItem } from '@/types/database';

export async function fetchUpcomingEvents(limit = 9): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null)
    .gte('event_date', new Date().toISOString())
    .order('event_date')
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as EventItem[];
}

export async function fetchPastEvents(limit = 9): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null)
    .lt('event_date', new Date().toISOString())
    .order('event_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as EventItem[];
}

export async function fetchPublicEventBySlug(slug: string): Promise<EventItem | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as EventItem | null;
}

export async function fetchAdminEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .is('deleted_at', null)
    .order('event_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as EventItem[];
}

export async function fetchAdminEventById(id: string): Promise<EventItem | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as EventItem | null;
}

export async function createEvent(
  payload: Omit<Partial<EventItem>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>
): Promise<EventItem> {
  const { data, error } = await supabase
    .from('events')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as EventItem;
}

export async function updateEvent(
  id: string,
  patch: Omit<Partial<EventItem>, 'id' | 'created_at' | 'search_vector'>
): Promise<EventItem> {
  const { data, error } = await supabase
    .from('events')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EventItem;
}

export async function softDeleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
