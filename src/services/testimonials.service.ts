import { supabase } from '@/lib/supabase';
import type { Testimonial } from '@/types/database';

type TestimonialSummary = Testimonial & {
  property_title: string | null;
  property_slug: string | null;
  project_title: string | null;
  project_slug: string | null;
};

export async function fetchFeaturedTestimonials(limit = 6): Promise<TestimonialSummary[]> {
  const { data, error } = await supabase
    .from('testimonials_summary')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order')
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as TestimonialSummary[];
}

export async function fetchAllTestimonials(): Promise<TestimonialSummary[]> {
  const { data, error } = await supabase
    .from('testimonials_summary')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return (data ?? []) as TestimonialSummary[];
}

export async function fetchAdminTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order');

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

export async function createTestimonial(
  payload: Omit<Partial<Testimonial>, 'id' | 'created_at' | 'updated_at'>
): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function updateTestimonial(
  id: string,
  patch: Omit<Partial<Testimonial>, 'id' | 'created_at'>
): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function hardDeleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
