/**
 * Zod validation schemas for all admin CRUD forms.
 *
 * Centralised here so schemas are:
 *   - Reused between the "New" and "Edit" form for each entity
 *   - Easily tested independently of React components
 *   - The single source of truth for field constraints
 *
 * Each schema is the base; pages use z.infer<typeof xxxSchema> as the
 * form value type and pass it to useForm<T>({ resolver: zodResolver(schema) }).
 */

import { z } from 'zod';

// ── Shared helpers ────────────────────────────────────────────────────────────

const optionalUrl = z
  .string()
  .url('Must be a valid URL (https://...)')
  .optional()
  .or(z.literal(''));

const optionalEmail = z
  .string()
  .email('Must be a valid email address')
  .optional()
  .or(z.literal(''));

const slug = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
  .optional()
  .or(z.literal(''));

// ── Property ──────────────────────────────────────────────────────────────────

export const propertySchema = z.object({
  title:              z.string().min(3, 'Title is required').max(200),
  slug,
  excerpt:            z.string().max(300).optional(),
  description:        z.string().optional(),
  category_id:        z.string().uuid('Select a category'),
  project_id:         z.string().uuid().optional().or(z.literal('')),
  price_label:        z.string().min(1, 'Price label is required').max(60),
  price_amount:       z.coerce.number().positive().optional(),
  price_per_sqft:     z.coerce.number().positive().optional(),
  location_area:      z.string().max(100).optional(),
  location_city:      z.string().max(100).optional(),
  location_state:     z.string().max(100).optional(),
  location_pincode:   z.string().max(10).optional(),
  address_full:       z.string().max(300).optional(),
  area_sqft:          z.coerce.number().positive().optional(),
  bedrooms:           z.coerce.number().int().min(0).max(20).optional(),
  bathrooms:          z.coerce.number().int().min(0).max(20).optional(),
  floor_number:       z.coerce.number().int().min(0).optional(),
  total_floors:       z.coerce.number().int().min(1).optional(),
  facing:             z.enum(['North','South','East','West','North-East','North-West','South-East','South-West']).optional(),
  furnishing_status:  z.enum(['Unfurnished','Semi-Furnished','Fully Furnished']).optional(),
  possession_status:  z.enum(['Ready to Move','Under Construction','Coming Soon']).optional(),
  possession_date:    z.string().optional(),
  amenities:          z.array(z.string()).optional(),
  status:             z.enum(['draft','active','sold','coming_soon']),
  is_featured:        z.boolean().optional(),
  is_verified:        z.boolean().optional(),
  sort_order:         z.coerce.number().int().min(0).optional(),
  video_url:          optionalUrl,
  map_embed_url:      z.string().optional(),
  seo_title:          z.string().max(70).optional(),
  seo_description:    z.string().max(160).optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

// ── Project ───────────────────────────────────────────────────────────────────

export const projectSchema = z.object({
  title:               z.string().min(3).max(200),
  slug,
  subtitle:            z.string().max(300).optional(),
  description:         z.string().optional(),
  location_area:       z.string().max(100).optional(),
  location_city:       z.string().max(100).optional(),
  location_state:      z.string().max(100).optional(),
  address_full:        z.string().max(300).optional(),
  launch_date:         z.string().optional(),
  expected_completion: z.string().optional(),
  possession_date:     z.string().optional(),
  status:              z.enum(['upcoming','ongoing','completed','fully_sold']),
  total_units:         z.coerce.number().int().positive().optional(),
  available_units:     z.coerce.number().int().min(0).optional(),
  highlights:          z.array(z.string()).optional(),
  rera_number:         z.string().max(50).optional(),
  rera_valid_until:    z.string().optional(),
  video_url:           optionalUrl,
  is_featured:         z.boolean().optional(),
  sort_order:          z.coerce.number().int().min(0).optional(),
  seo_title:           z.string().max(70).optional(),
  seo_description:     z.string().max(160).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// ── Team Member ───────────────────────────────────────────────────────────────

export const teamMemberSchema = z.object({
  full_name:   z.string().min(2).max(100),
  position:    z.string().min(2).max(100),
  department:  z.string().max(60).optional(),
  bio:         z.string().optional(),
  short_bio:   z.string().max(200).optional(),
  email:       optionalEmail,
  phone:       z.string().max(20).optional(),
  display_email: optionalEmail,
  rank_order:  z.coerce.number().int().min(0).optional(),
  is_active:   z.boolean().optional(),
  is_founder:  z.boolean().optional(),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

// ── Event ─────────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  title:                 z.string().min(3).max(200),
  slug,
  short_description:     z.string().max(300).optional(),
  description:           z.string().optional(),
  event_date:            z.string().min(1, 'Event date is required'),
  event_end_date:        z.string().optional(),
  venue_name:            z.string().max(150).optional(),
  venue_address:         z.string().max(300).optional(),
  google_maps_url:       optionalUrl,
  project_id:            z.string().uuid().optional().or(z.literal('')),
  registration_link:     optionalUrl,
  registration_deadline: z.string().optional(),
  max_attendees:         z.coerce.number().int().positive().optional(),
  status:                z.enum(['draft','published','cancelled']),
  is_featured:           z.boolean().optional(),
  is_free:               z.boolean().optional(),
  sort_order:            z.coerce.number().int().min(0).optional(),
  seo_title:             z.string().max(70).optional(),
  seo_description:       z.string().max(160).optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

// ── Blog Post ─────────────────────────────────────────────────────────────────

export const blogPostSchema = z.object({
  title:               z.string().min(3).max(200),
  slug,
  excerpt:             z.string().max(300).optional(),
  content:             z.string().optional(),
  category:            z.string().max(60).optional(),
  tags:                z.array(z.string()).optional(),
  author_id:           z.string().uuid().optional().or(z.literal('')),
  author_name_override: z.string().max(100).optional(),
  cover_image_alt:     z.string().max(200).optional(),
  status:              z.enum(['draft','published','archived']),
  scheduled_for:       z.string().optional(),
  seo_title:           z.string().max(70).optional(),
  seo_description:     z.string().max(160).optional(),
  canonical_url:       optionalUrl,
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

// ── Testimonial ───────────────────────────────────────────────────────────────

export const testimonialSchema = z.object({
  customer_name:    z.string().min(2).max(100),
  designation:      z.string().max(100).optional(),
  quote:            z.string().min(10, 'Quote must be at least 10 characters').max(500),
  rating:           z.coerce.number().int().min(1).max(5).optional(),
  property_id:      z.string().uuid().optional().or(z.literal('')),
  project_id:       z.string().uuid().optional().or(z.literal('')),
  transaction_date: z.string().optional(),
  is_verified:      z.boolean().optional(),
  is_active:        z.boolean().optional(),
  is_featured:      z.boolean().optional(),
  sort_order:       z.coerce.number().int().min(0).optional(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

// ── Legal Page ────────────────────────────────────────────────────────────────

export const legalPageSchema = z.object({
  page_key:       z.enum(['terms','privacy','disclaimer','refund']),
  title:          z.string().min(3).max(200),
  content:        z.string().min(10, 'Content cannot be empty'),
  change_summary: z.string().max(300).optional(),
});

export type LegalPageFormValues = z.infer<typeof legalPageSchema>;

// ── Website Settings ──────────────────────────────────────────────────────────

export const settingsSchema = z.object({
  company_name:     z.string().min(2).max(100),
  tagline:          z.string().max(200).optional(),
  mission:          z.string().optional(),
  vision:           z.string().optional(),
  phone_primary:    z.string().max(20).optional(),
  phone_secondary:  z.string().max(20).optional(),
  email_primary:    optionalEmail,
  email_inquiries:  optionalEmail,
  admin_alert_email: optionalEmail,
  address_line1:    z.string().max(200).optional(),
  address_line2:    z.string().max(200).optional(),
  address_city:     z.string().max(60).optional(),
  address_state:    z.string().max(60).optional(),
  address_pincode:  z.string().max(10).optional(),
  whatsapp_number:  z.string().max(20).optional(),
  whatsapp_greeting: z.string().max(300).optional(),
  facebook_url:     optionalUrl,
  instagram_url:    optionalUrl,
  youtube_url:      optionalUrl,
  linkedin_url:     optionalUrl,
  twitter_url:      optionalUrl,
  seo_default_title: z.string().max(70).optional(),
  seo_default_desc:  z.string().max(160).optional(),
  google_maps_embed: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

// ── Lead Stage Update (admin) ─────────────────────────────────────────────────

export const leadUpdateSchema = z.object({
  stage:        z.enum(['new','contacted','qualified','site_visit_booked','site_visit_done','negotiation','documentation','converted','lost','unresponsive']).optional(),
  priority:     z.enum(['low','medium','high','urgent']).optional(),
  assigned_to:  z.string().max(100).optional(),
  admin_notes:  z.string().max(2000).optional(),
  follow_up_date: z.string().optional(),
});

export type LeadUpdateFormValues = z.infer<typeof leadUpdateSchema>;
