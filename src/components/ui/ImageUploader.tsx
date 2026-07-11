import { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { GripVertical, Trash2, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { imageUrl } from '@/lib/imageUrl';
import type { ImageEntry } from '@/types/database';

interface ImageUploaderProps {
  /** Storage path prefix, e.g. `properties/<uuid>` — images are stored under `media/<entityPath>/...`. */
  entityPath: string;
  images: ImageEntry[];
  onChange: (images: ImageEntry[]) => void;
  maxImages?: number;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp' as const,
};

/**
 * Uploads images to the `media` bucket under `media/<entityPath>/<filename>`,
 * compresses client-side before upload (per D-stack: browser-image-compression),
 * and maintains the `images` JSONB array shape: [{ path, alt, sort }].
 *
 * The first image (sort: 0) is always treated as the hero image — drag to
 * reorder, or use the "Set as hero" action on non-first images.
 */
export function ImageUploader({ entityPath, images, onChange, maxImages = 12 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    try {
      const newEntries: ImageEntry[] = [];

      for (const file of filesToUpload) {
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
        const ext = 'webp';
        const filename = `${crypto.randomUUID()}.${ext}`;
        const path = `${entityPath}/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, compressed, { contentType: 'image/webp', upsert: false });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        newEntries.push({
          path: `media/${path}`,
          alt: '',
          sort: images.length + newEntries.length,
        });
      }

      onChange([...images, ...newEntries]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function updateAlt(index: number, alt: string) {
    const next = [...images];
    next[index] = { ...next[index], alt };
    onChange(next);
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sort: i }));
    onChange(next);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((img, i) => ({ ...img, sort: i })));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="inline-flex items-center gap-2 rounded-md border border-navy-600 px-4 py-2.5 text-sm font-semibold text-navy-600 hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isUploading ? 'Uploading...' : 'Upload images'}
        </button>
        <span className="text-sm text-ink-secondary">
          {images.length} / {maxImages} images · first image is the hero
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <ul className="space-y-2">
          {images.map((img, index) => (
            <li
              key={img.path}
              className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3 sm:flex-nowrap sm:p-2"
            >
              {/* Row 1 (mobile) / left cluster (desktop): grip + thumbnail + hero badge */}
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 shrink-0 text-ink-secondary" aria-hidden="true" />
                <img
                  src={imageUrl(img.path, 'thumb')}
                  alt={img.alt || 'Untitled image'}
                  className="h-14 w-14 shrink-0 rounded object-cover"
                />
                {index === 0 && (
                  <span className="shrink-0 rounded-full bg-gold-50 px-2 py-0.5 text-xs font-medium text-gold-800">
                    Hero
                  </span>
                )}
              </div>

              {/* Alt text input — full width on mobile (wraps to its own row), flexes on desktop */}
              <input
                type="text"
                value={img.alt}
                onChange={(e) => updateAlt(index, e.target.value)}
                placeholder="Alt text (for SEO & accessibility)"
                className="order-3 w-full min-w-0 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600 sm:order-none sm:w-auto sm:flex-1 sm:py-1.5"
              />

              {/* Reorder / delete actions — 44px-ish touch targets */}
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded p-2 text-ink-secondary hover:bg-gray-100 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded p-2 text-ink-secondary hover:bg-gray-100 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
