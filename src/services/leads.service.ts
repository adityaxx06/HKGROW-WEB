import { supabase } from '@/lib/supabase';
import type { Lead, LeadWithDetails, LeadsSourceAnalytics, AdminDashboardStats } from '@/types/database';

export interface LeadFilters {
  stage?: string;
  priority?: string;
  source?: string;
  search?: string;
  isArchived?: boolean;
  followUpToday?: boolean;
  page?: number;
  pageSize?: number;
}

// ── Admin reads ───────────────────────────────────────────────────────────────

export async function fetchLeads(
  filters: LeadFilters = {}
): Promise<{ data: LeadWithDetails[]; count: number }> {
  const {
    stage, priority, source, search,
    isArchived = false, followUpToday = false,
    page = 1, pageSize = 25,
  } = filters;

  let query = supabase
    .from('leads_with_details')
    .select('*', { count: 'exact' })
    .eq('is_archived', isArchived);

  if (stage)         query = query.eq('stage', stage);
  if (priority)      query = query.eq('priority', priority);
  if (source)        query = query.eq('source', source);
  if (followUpToday) query = query.eq('follow_up_date', new Date().toISOString().slice(0, 10));
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as LeadWithDetails[], count: count ?? 0 };
}

export async function fetchLeadById(id: string): Promise<LeadWithDetails | null> {
  const { data, error } = await supabase
    .from('leads_with_details')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as LeadWithDetails | null;
}

export async function fetchDashboardStats(): Promise<AdminDashboardStats | null> {
  const { data, error } = await supabase
    .from('admin_dashboard_stats')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data as AdminDashboardStats | null;
}

export async function fetchSourceAnalytics(): Promise<LeadsSourceAnalytics[]> {
  const { data, error } = await supabase
    .from('leads_source_analytics')
    .select('*');

  if (error) throw error;
  return (data ?? []) as LeadsSourceAnalytics[];
}

// ── Admin mutations ───────────────────────────────────────────────────────────

export async function updateLead(
  id: string,
  patch: Partial<
    Pick<Lead,
      'stage' | 'priority' | 'assigned_to' | 'admin_notes' |
      'follow_up_date' | 'tags' | 'is_archived'
    >
  >
): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function archiveLead(id: string): Promise<void> {
  const { error } = await supabase
    .from('leads')
    .update({ is_archived: true })
    .eq('id', id);

  if (error) throw error;
}
