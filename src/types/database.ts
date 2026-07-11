/**
 * Hand-written types matching the schema in /migrations (001-014).
 *
 * NOTE: Once the project is linked to a live Supabase instance, regenerate
 * this file with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 * and re-apply the `Database` wrapper/export shape below if the generator
 * output differs. Until then, these hand types keep the app type-safe.
 */

export type ImageEntry = {
  path: string;
  alt: string;
  sort: number;
};

export interface WebsiteSettings {
  id: 'singleton';
  company_name: string;
  tagline: string | null;
  mission: string | null;
  vision: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email_primary: string | null;
  email_inquiries: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_city: string | null;
  address_state: string | null;
  address_pincode: string | null;
  google_maps_embed: string | null;
  whatsapp_number: string | null;
  whatsapp_greeting: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  seo_default_title: string | null;
  seo_default_desc: string | null;
  seo_og_image_path: string | null;
  schema_org_json: Record<string, unknown> | null;
  admin_alert_email: string | null;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  section_key: string;
  page: string;
  label: string;
  content: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type ProjectStatus = 'upcoming' | 'ongoing' | 'completed' | 'fully_sold';

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  location_area: string | null;
  location_city: string | null;
  location_state: string | null;
  address_full: string | null;
  google_maps_lat: number | null;
  google_maps_lng: number | null;
  launch_date: string | null;
  expected_completion: string | null;
  possession_date: string | null;
  status: ProjectStatus;
  total_units: number | null;
  available_units: number | null;
  highlights: string[];
  rera_number: string | null;
  rera_valid_until: string | null;
  images: ImageEntry[];
  brochure_path: string | null;
  video_url: string | null;
  is_featured: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_path: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type PropertyStatus = 'draft' | 'active' | 'sold' | 'coming_soon';
export type Facing =
  | 'North' | 'South' | 'East' | 'West'
  | 'North-East' | 'North-West' | 'South-East' | 'South-West';
export type FurnishingStatus = 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished';
export type PossessionStatus = 'Ready to Move' | 'Under Construction' | 'Coming Soon';

export interface Property {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  category_id: string;
  project_id: string | null;
  price_amount: number | null;
  price_label: string;
  price_per_sqft: number | null;
  location_area: string | null;
  location_city: string | null;
  location_state: string | null;
  location_pincode: string | null;
  address_full: string | null;
  google_maps_lat: number | null;
  google_maps_lng: number | null;
  map_embed_url: string | null;
  area_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_number: number | null;
  total_floors: number | null;
  facing: Facing | null;
  furnishing_status: FurnishingStatus | null;
  possession_status: PossessionStatus | null;
  possession_date: string | null;
  amenities: string[];
  status: PropertyStatus;
  is_featured: boolean;
  is_verified: boolean;
  sort_order: number;
  images: ImageEntry[];
  video_url: string | null;
  brochure_path: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_path: string | null;
  schema_override: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deleted_at: string | null;
}

/** properties_public view: properties + category/project names joined */
export interface PropertyPublic extends Omit<Property, 'deleted_at'> {
  category_name: string | null;
  category_slug: string | null;
  category_icon: string | null;
  project_title: string | null;
  project_slug: string | null;
}

export interface TeamMember {
  id: string;
  full_name: string;
  position: string;
  department: string | null;
  bio: string | null;
  short_bio: string | null;
  /** Admin-only — never selected on public pages. */
  email?: string | null;
  /** Admin-only — never selected on public pages. */
  phone?: string | null;
  display_email: string | null;
  photo_path: string | null;
  social_links: Record<string, string>;
  rank_order: number;
  is_active: boolean;
  is_founder: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Safe public projection — use this column list explicitly in queries. */
export const TEAM_MEMBER_PUBLIC_COLUMNS =
  'id, full_name, position, department, bio, short_bio, display_email, photo_path, social_links, rank_order, is_founder';

export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  event_date: string;
  event_end_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  google_maps_url: string | null;
  project_id: string | null;
  registration_link: string | null;
  registration_deadline: string | null;
  attendee_count: number;
  max_attendees: number | null;
  status: EventStatus;
  images: ImageEntry[];
  is_featured: boolean;
  is_free: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BlogStatus = 'draft' | 'published' | 'archived';
export type ContentFormat = 'html' | 'markdown';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  content_format: ContentFormat;
  category: string | null;
  tags: string[];
  author_id: string | null;
  author_name_override: string | null;
  cover_image_path: string | null;
  cover_image_alt: string | null;
  reading_time_minutes: number;
  view_count: number;
  related_post_ids: string[];
  status: BlogStatus;
  published_at: string | null;
  scheduled_for: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_path: string | null;
  canonical_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** blog_posts_public view */
export interface BlogPostPublic
  extends Omit<BlogPost, 'deleted_at' | 'author_id'> {
  author_id: string | null;
  author_name: string | null;
  author_photo_path: string | null;
}

export type LeadSource =
  | 'contact_form' | 'property_inquiry' | 'whatsapp_click' | 'event_registration'
  | 'blog_cta' | 'brochure_download' | 'phone_call' | 'referral' | 'walk_in'
  | 'site_visit_form' | 'other';

export type LeadStage =
  | 'new' | 'contacted' | 'qualified' | 'site_visit_booked' | 'site_visit_done'
  | 'negotiation' | 'documentation' | 'converted' | 'lost' | 'unresponsive';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  preferred_contact: 'phone' | 'email' | 'whatsapp' | null;
  source: LeadSource;
  message: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer_url: string | null;
  property_id: string | null;
  event_id: string | null;
  blog_post_id: string | null;
  interest_notes: string | null;
  budget_min: number | null;
  budget_max: number | null;
  requirement_type: 'Buy' | 'Invest' | 'Rent' | 'Not Sure' | null;
  timeline: '1-3 months' | '3-6 months' | '6-12 months' | '1 year+' | 'Immediate' | null;
  stage: LeadStage;
  priority: LeadPriority;
  assigned_to: string | null;
  admin_notes: string | null;
  follow_up_date: string | null;
  tags: string[];
  is_consented: boolean;
  consented_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

/** leads_with_details view */
export interface LeadWithDetails extends Lead {
  property_title: string | null;
  property_slug: string | null;
  event_title: string | null;
  event_slug: string | null;
  blog_post_title: string | null;
  blog_post_slug: string | null;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  designation: string | null;
  photo_path: string | null;
  quote: string;
  rating: number | null;
  property_id: string | null;
  project_id: string | null;
  transaction_date: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type LegalPageKey = 'terms' | 'privacy' | 'disclaimer' | 'refund';
export type LegalPageStatus = 'draft' | 'published' | 'archived';

export interface LegalPage {
  id: string;
  page_key: LegalPageKey;
  version: number;
  title: string;
  content: string;
  status: LegalPageStatus;
  effective_date: string | null;
  change_summary: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AdminDashboardStats {
  active_properties: number;
  sold_properties: number;
  draft_properties: number;
  featured_properties: number;
  active_projects: number;
  team_members_count: number;
  upcoming_events: number;
  published_posts: number;
  total_leads: number;
  new_leads: number;
  leads_this_week: number;
  follow_ups_today: number;
  unseen_leads: number;
}

export interface LeadsSourceAnalytics {
  source: LeadSource;
  total_leads: number;
  converted_count: number;
  lost_count: number;
  active_count: number;
  conversion_rate_pct: number;
  first_lead_at: string;
  latest_lead_at: string;
}

/**
 * Minimal `Database` shape for supabase-js generics. Only `Row` types are
 * declared (Insert/Update default to `Partial<Row>`-ish via `any` to avoid
 * hand-maintaining three shapes per table before the real generator runs).
 */
/**
 * Structural note: supabase-js (via @supabase/postgrest-js) requires every
 * table to have Row/Insert/Update/Relationships, and every view to have at
 * least Row/Relationships (updatable views also need Insert/Update). If any
 * of those keys are missing, TypeScript silently widens query results to
 * `never` everywhere — not just on the table that's missing the shape. See
 * GenericTable / GenericView in @supabase/postgrest-js/src/types/common/common.ts.
 *
 * `website_settings` is a singleton row that is never inserted via the app
 * (it's seeded once by migration 014) — its Insert type is intentionally
 * the same shape as Update rather than `never`, because `never` itself
 * fails the `Record<string, unknown>` structural check that GenericTable
 * requires, which is what caused the original "never[]" cascade.
 */
type NoRelationships = { Relationships: [] };

export interface Database {
  public: {
    Tables: {
      website_settings: {
        Row: WebsiteSettings;
        Insert: Partial<Omit<WebsiteSettings, 'id'>> & { id: 'singleton' };
        Update: Partial<Omit<WebsiteSettings, 'id'>>;
      } & NoRelationships;
      content_blocks: {
        Row: ContentBlock;
        Insert: Partial<ContentBlock>;
        Update: Partial<ContentBlock>;
      } & NoRelationships;
      property_categories: {
        Row: PropertyCategory;
        Insert: Partial<PropertyCategory>;
        Update: Partial<PropertyCategory>;
      } & NoRelationships;
      projects: {
        Row: Project;
        Insert: Partial<Project>;
        Update: Partial<Project>;
      } & NoRelationships;
      properties: {
        Row: Property;
        Insert: Partial<Property>;
        Update: Partial<Property>;
      } & NoRelationships;
      team_members: {
        Row: TeamMember;
        Insert: Partial<TeamMember>;
        Update: Partial<TeamMember>;
      } & NoRelationships;
      events: {
        Row: EventItem;
        Insert: Partial<EventItem>;
        Update: Partial<EventItem>;
      } & NoRelationships;
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost>;
        Update: Partial<BlogPost>;
      } & NoRelationships;
      leads: {
        Row: Lead;
        Insert: Partial<Lead>;
        Update: Partial<Lead>;
      } & NoRelationships;
      testimonials: {
        Row: Testimonial;
        Insert: Partial<Testimonial>;
        Update: Partial<Testimonial>;
      } & NoRelationships;
      legal_pages: {
        Row: LegalPage;
        Insert: Partial<LegalPage>;
        Update: Partial<LegalPage>;
      } & NoRelationships;
    };
    Views: {
      properties_public: { Row: PropertyPublic } & NoRelationships;
      properties_admin: {
        Row: Property & { category_name: string | null; project_title: string | null };
      } & NoRelationships;
      leads_with_details: { Row: LeadWithDetails } & NoRelationships;
      admin_dashboard_stats: { Row: AdminDashboardStats } & NoRelationships;
      leads_source_analytics: { Row: LeadsSourceAnalytics } & NoRelationships;
      blog_posts_public: { Row: BlogPostPublic } & NoRelationships;
      testimonials_summary: {
        Row: Testimonial & {
          property_title: string | null;
          property_slug: string | null;
          project_title: string | null;
          project_slug: string | null;
        };
      } & NoRelationships;
    };
    Functions: {
      submit_lead: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_email?: string | null;
          p_message?: string | null;
          p_source?: LeadSource;
          p_property_id?: string | null;
          p_event_id?: string | null;
          p_blog_post_id?: string | null;
          p_referrer_url?: string | null;
          p_utm_source?: string | null;
          p_utm_medium?: string | null;
          p_utm_campaign?: string | null;
          p_preferred_contact?: string | null;
          p_interest_notes?: string | null;
          p_budget_min?: number | null;
          p_budget_max?: number | null;
          p_requirement_type?: string | null;
          p_timeline?: string | null;
          p_honeypot?: string | null;
        };
        /** {id: string|null, duplicate: boolean, bot?: boolean} */
        Returns: { id: string | null; duplicate: boolean; bot?: boolean };
      };
      increment_blog_view_count: {
        Args: { post_id: string };
        Returns: void;
      };
    };
  };
}
