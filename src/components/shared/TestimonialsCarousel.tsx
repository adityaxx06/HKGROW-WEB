import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Testimonial } from '@/types/database';
import { truncate } from '@/utils/formatters';

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const count = testimonials.length;
  if (count === 0) return null;

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  // Auto-advance every 8 seconds — slower, more deliberate pacing
  useEffect(() => {
    const timer = setTimeout(() => go(1), 8000);
    return () => clearTimeout(timer);
  }, [index, go]);

  const t = testimonials[index];
  if (!t) return null;

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
  };

  return (
    <div className="relative overflow-hidden">
      {/* Main card */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={t.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto max-w-2xl rounded-lg border border-gray-100 bg-white px-8 py-12 text-center shadow-card-lg sm:px-14 sm:py-16"
        >
          {/* Large quotation glyph */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 select-none font-display text-7xl leading-none text-gold-200 sm:text-8xl"
          >
            "
          </span>

          {/* Stars */}
          <div className="relative mb-6 flex justify-center gap-1">
            {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold-500 text-gold-500" />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="relative font-display text-xl font-normal leading-relaxed text-navy-800 sm:text-2xl">
            {truncate(t.quote, 280)}
          </blockquote>

          <span className="mx-auto mt-7 block h-px w-10 bg-gold-400/50" aria-hidden="true" />

          {/* Author */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-50 text-base font-semibold text-navy-700">
              {t.customer_name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-navy-800">{t.customer_name}</p>
              {t.designation && (
                <p className="text-sm text-ink-secondary">{t.designation}</p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm hover:border-gold-400 hover:shadow-card transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5 text-navy-700" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-sm border border-gray-200 bg-white p-2.5 shadow-sm hover:border-gold-400 hover:shadow-card transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5 text-navy-700" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="mt-8 flex justify-center gap-2.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-7 bg-gold-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
