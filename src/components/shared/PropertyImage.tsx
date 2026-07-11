import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { imageUrl } from '@/lib/imageUrl';

type ImageSize = 'thumb' | 'card' | 'detail' | 'hero' | 'original';
type AspectRatio = '4/3' | '16/9' | '3/2' | '1/1' | 'auto';

interface PropertyImageProps {
  path: string | null | undefined;
  alt?: string;
  size?: ImageSize;
  /** Tailwind aspect-ratio class e.g. "aspect-[4/3]". Defaults to 4/3. */
  aspect?: AspectRatio;
  className?: string;
  /** Use eager loading for above-the-fold images */
  eager?: boolean;
  /** Extra classes on the img element */
  imgClassName?: string;
}

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  '4/3':  'aspect-[4/3]',
  '16/9': 'aspect-video',
  '3/2':  'aspect-[3/2]',
  '1/1':  'aspect-square',
  'auto': '',
};

export function PropertyImage({
  path,
  alt = '',
  size = 'card',
  aspect = '4/3',
  className,
  eager = false,
  imgClassName,
}: PropertyImageProps) {
  const [errored, setErrored] = useState(false);
  const src = imageUrl(path, size);
  const aspectClass = ASPECT_CLASSES[aspect];

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden bg-navy-50',
        aspectClass,
        className,
      )}
    >
      {src && !errored ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setErrored(true)}
          className={clsx(
            'h-full w-full object-cover transition-transform duration-500',
            imgClassName,
          )}
        />
      ) : (
        /* Fallback placeholder */
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-navy-200">
          <Building2 className="h-10 w-10" />
          <span className="text-xs">No image</span>
        </div>
      )}
    </div>
  );
}
