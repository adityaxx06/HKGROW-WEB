import { supabase } from '@/lib/supabase';
import type { BlogPost, BlogPostPublic } from '@/types/database';

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function fetchPublicPosts(
  filters: BlogFilters = {}
): Promise<{ data: BlogPostPublic[]; count: number }> {
  const { category, tag, search, page = 1, pageSize = 9 } = filters;

  let query = supabase
    .from('blog_posts_public')
    .select('*', { count: 'exact' });

  if (category) query = query.eq('category', category);
  if (tag)      query = query.contains('tags', [tag]);
  if (search)   query = query.textSearch('search_vector', search, {
    type: 'websearch',
    config: 'english',
  });

  const from = (page - 1) * pageSize;
  query = query.order('published_at', { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as BlogPostPublic[], count: count ?? 0 };
}

export async function fetchPublicPostBySlug(slug: string): Promise<BlogPostPublic | null> {
  const { data, error } = await supabase
    .from('blog_posts_public')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as BlogPostPublic | null;
}

export async function fetchLatestPosts(limit = 3): Promise<BlogPostPublic[]> {
  const { data, error } = await supabase
    .from('blog_posts_public')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as BlogPostPublic[];
}

export async function incrementViewCount(postId: string): Promise<void> {
  await supabase.rpc('increment_blog_view_count', { post_id: postId });
  // Fire-and-forget — errors silently swallowed, not worth surfacing to user
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminBlogFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAdminPosts(
  filters: AdminBlogFilters = {}
): Promise<{ data: BlogPost[]; count: number }> {
  const { status, search, page = 1, pageSize = 20 } = filters;

  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .is('deleted_at', null);

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);

  const from = (page - 1) * pageSize;
  query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as BlogPost[], count: count ?? 0 };
}

export async function fetchAdminPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as BlogPost | null;
}

export async function createPost(
  payload: Omit<Partial<BlogPost>, 'id' | 'created_at' | 'updated_at' | 'search_vector'>
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function updatePost(
  id: string,
  patch: Omit<Partial<BlogPost>, 'id' | 'created_at' | 'search_vector'>
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function softDeletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
