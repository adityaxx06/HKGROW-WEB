import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/database';

export async function fetchPublicProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order');

  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchPublicProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Project | null;
}

export async function fetchFeaturedProjects(limit = 3): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_featured', true)
    .is('deleted_at', null)
    .order('sort_order')
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchAdminProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function fetchAdminProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Project | null;
}

export async function createProject(
  payload: Omit<Partial<Project>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(
  id: string,
  patch: Omit<Partial<Project>, 'id' | 'created_at' | 'search_vector'>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function softDeleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
