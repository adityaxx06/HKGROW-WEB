import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { WebsiteSettings } from '@/types/database';
import { ROUTES } from '@/constants/routes';

// Stable CDN URL — freely licensed (Pexels free license, no attribution required)
const HERO_IMAGE =
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80';

interface HeroBlock {
  badge_text?: string;
  heading?: string;
  subheading?: string;
  cta_primary_text?: string;
  cta_primary_url?: string;
  cta_secondary_text?: string;
  cta_secondary_url?: string;
}

interface Props {
  hero: HeroBlock;
  settings: WebsiteSettings | null | undefined;
}

export function HeroSection({ hero, settings }: Props) {
  const { scrollY } = useScroll();
  // Parallax: background moves at 40% of scroll speed
  const bgY = useTransform(scrollY, [0, 600], ['0%', '24%']);

  function scrollDown() {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  }

  return (
    <section className="relative -mt-20 flex min-h-screen items-center" style={{ overflow: 'hidden' }}>
      {/* ── Background image with parallax ── */}
      <motion.div
        style={{ y: bgY, top: '-10%', bottom: '-10%', left: 0, right: 0, position: 'absolute' }}
        aria-hidden="true"
      >
        <img
          src={HERO_IMAGE}
          alt="Premium real estate backdrop"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* ── Dark gradient overlay ── */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/55"
        aria-hidden="true"
      />
      {/* Bottom vignette for section transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy-900/70 to-transparent"
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="container-page relative z-10 py-20 sm:py-28 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {hero.badge_text && (
            <div className="mb-7 inline-flex items-center gap-3">
              <span className="h-px w-8 bg-gold-400/70" />
              <span className="text-xs font-semibold uppercase tracking-wider-luxe text-gold-300">
                {hero.badge_text}
              </span>
            </div>
          )}

          <h1 className="max-w-3xl break-words font-display text-4xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {hero.heading ?? settings?.tagline ?? (
              <>
                Building Dreams,{' '}
                <span className="italic text-gold-300">Delivering Trust</span>
              </>
            )}
          </h1>

          <p className="mt-7 max-w-xl break-words text-base leading-relaxed text-navy-100/90 sm:text-lg lg:text-xl">
            {hero.subheading ?? settings?.seo_default_desc ?? 'Premium RERA-registered properties in Prayagraj'}
          </p>

          <motion.div
            className="mt-11 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={hero.cta_primary_url ?? ROUTES.properties.list}>
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 shadow-lg"
              >
                {hero.cta_primary_text ?? 'Explore Properties'}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to={hero.cta_secondary_url ?? ROUTES.contact}>
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-blue-1000 hover:text-white transition-colors duration-300 shadow-lg"
              >
                {hero.cta_secondary_text ?? 'Book Free Consultation'}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <button
        onClick={scrollDown}
        aria-label="Scroll down"
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white/90 transition-colors duration-500"
      >
        <span className="text-[11px] font-medium tracking-wider-luxe uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce-slow" />
      </button>
    </section>
  );
}
