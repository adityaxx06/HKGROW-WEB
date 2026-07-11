import { supabase } from '@/lib/supabase';
import { TEAM_MEMBER_PUBLIC_COLUMNS, type TeamMember } from '@/types/database';

// ── Public ────────────────────────────────────────────────────────────────────
// NOTE: Always use TEAM_MEMBER_PUBLIC_COLUMNS — never select `email` or `phone`
// on public-facing queries. RLS allows anon to read the row but not specific
// columns — the column restriction is enforced by the explicit select list.

export async function fetchPublicTeamMembers(): Promise<Omit<TeamMember, 'email' | 'phone'>[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select(TEAM_MEMBER_PUBLIC_COLUMNS)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('rank_order');

  if (error) throw error;
  return (data ?? []) as Omit<TeamMember, 'email' | 'phone'>[];
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function fetchAdminTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .is('deleted_at', null)
    .order('rank_order');

  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function fetchAdminTeamMemberById(id: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as TeamMember | null;
}

export async function createTeamMember(
  payload: Omit<Partial<TeamMember>, 'id' | 'created_at' | 'updated_at'>
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function updateTeamMember(
  id: string,
  patch: Omit<Partial<TeamMember>, 'id' | 'created_at'>
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TeamMember;
}

export async function softDeleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

/** Batch update rank_order for drag-and-drop reordering */
export async function reorderTeamMembers(
  updates: { id: string; rank_order: number }[]
): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .upsert(updates, { onConflict: 'id' });

  if (error) throw error;
}
