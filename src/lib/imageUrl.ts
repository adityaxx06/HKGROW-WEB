import { env } from './env';

type ImageSize = 'thumb' | 'card' | 'detail' | 'hero' | 'original';
type Bucket = 'media' | 'site-assets';

const SIZE_PRESETS: Record<ImageSize, { width: number; height?: number } | null> = {
  thumb:    { width: 160,  height: 160 },
  card:     { width: 480,  height: 360 },
  detail:   { width: 1024, height: 768 },
  hero:     { width: 1600, height: 900 },
  original: null,
};

/**
 * Builds a public Supabase Storage URL for an image, using the image
 * transformation API for resized variants.
 *
 * PATH CONVENTION (fixed in migration 015):
 *   images[].path in the DB stores the path WITHOUT the bucket prefix.
 *   e.g. "properties/<uuid>/hero.webp" (not "media/properties/...")
 *
 * If the path accidentally still has a "media/" prefix (older seeded data
 * before migration 015 runs), this function strips it to avoid double-prefix.
 */
export function imageUrl(
  path: string | null | undefined,
  size: ImageSize = 'card',
  bucket: Bucket = 'media'
): string {
  if (!path) return '';

  let cleanPath = path.replace(/^\/+/, '');
  if (cleanPath.startsWith(`${bucket}/`)) {
    cleanPath = cleanPath.slice(bucket.length + 1);
  }

  const base = env.SUPABASE_URL.replace(/\/+$/, '');
  const preset = SIZE_PRESETS[size];

  if (!preset) {
    return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  const params = new URLSearchParams({
    width:   String(preset.width),
    resize:  'cover',
    quality: '75',
  });
  if (preset.height) params.set('height', String(preset.height));

  return `${base}/storage/v1/render/image/public/${bucket}/${cleanPath}?${params.toString()}`;
}

export function isDocumentPath(path: string | null | undefined): boolean {
  return !!path && path.startsWith('documents/');
}

export function getHeroImage<T extends { path: string; alt: string; sort: number }>(
  images: T[] | null | undefined
): T | null {
  if (!images || images.length === 0) return null;
  return [...images].sort((a, b) => a.sort - b.sort)[0] ?? null;
}
