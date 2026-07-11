/**
 * Storage service — wraps Supabase Storage for the three buckets.
 *
 * Upload flow (per ImageUploader component):
 *   1. Compress image client-side (browser-image-compression)
 *   2. Call uploadMedia() → returns the storage path (no bucket prefix)
 *   3. Append { path, alt, sort } to the entity's `images` JSONB array
 *   4. Save the entity — the path is stored WITHOUT bucket prefix
 *
 * Path convention (enforced in migration 015):
 *   - STORED in DB: `<entity>/<uuid>/<filename>.webp`
 *   - BUCKET: always `media` for images
 *   - imageUrl() prepends the bucket when building URLs
 *
 * The `documents` bucket stores PDFs. Access is via signed URLs only
 * (bucket is private). Use createSignedBrochureUrl() in admin panel.
 */

import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

// ── Media bucket (images) ─────────────────────────────────────────────────────

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp' as const,
};

/**
 * Compress + upload an image to the `media` bucket.
 * Returns the storage path WITHOUT the bucket prefix (e.g. `properties/<uuid>/abc.webp`).
 */
export async function uploadMedia(
  file: File,
  entityPath: string // e.g. "properties/b0000000-..." or "team/aaa..."
): Promise<string> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  const filename = `${crypto.randomUUID()}.webp`;
  const storagePath = `${entityPath}/${filename}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(storagePath, compressed, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) throw error;
  return storagePath; // caller appends to images[] without bucket prefix
}

/**
 * Delete an image from the `media` bucket.
 * `path` is the path WITHOUT bucket prefix (as stored in DB).
 */
export async function deleteMedia(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('media')
    .remove([path]);

  if (error) throw error;
}

// ── Site-assets bucket ────────────────────────────────────────────────────────

export async function uploadSiteAsset(file: File, filename: string): Promise<string> {
  const { error } = await supabase.storage
    .from('site-assets')
    .upload(filename, file, { upsert: true });

  if (error) throw error;
  return filename; // e.g. "logo.svg", "favicon.ico"
}

// ── Documents bucket (private — PDFs) ────────────────────────────────────────

/**
 * Upload a brochure PDF to the private `documents` bucket.
 * Returns the storage path (e.g. `brochures/<property-id>/brochure-v1.pdf`).
 * Store this path in property.brochure_path or project.brochure_path.
 */
export async function uploadBrochure(file: File, entityId: string): Promise<string> {
  const filename = `brochure-v${Date.now()}.pdf`;
  const storagePath = `brochures/${entityId}/${filename}`;

  const { error } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) throw error;
  return storagePath;
}

/**
 * Generate a 1-hour signed URL for a brochure PDF (documents bucket is private).
 * Use this in the admin panel "Copy Brochure Link" action or to serve
 * download links to verified leads.
 */
export async function createSignedBrochureUrl(
  storagePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteBrochure(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('documents')
    .remove([storagePath]);

  if (error) throw error;
}
