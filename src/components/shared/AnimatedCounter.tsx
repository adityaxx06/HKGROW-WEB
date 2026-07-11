import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/**
 * Counts up from 0 to `target` when the element scrolls into view.
 * `value` is the raw string from CMS (e.g. "500+", "₹50Cr+") —
 * we extract the leading number, animate it, then reattach the suffix.
 */
export function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayed, setDisplayed] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric prefix and non-numeric suffix (e.g. "500+" → num=500, suffix="+")
    const match = value.match(/^([₹\s]*)(\d[\d,.]*)(.*)$/);
    if (!match) {
      setDisplayed(value);
      return;
    }
    const prefix = match[1] ?? '';
    const numStr  = match[2].replace(/,/g, '');
    const suffix  = match[3] ?? '';
    const target  = parseFloat(numStr);

    if (isNaN(target)) {
      setDisplayed(value);
      return;
    }

    const duration = 1800; // ms
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      // Format with commas if original had them
      const formatted = numStr.includes(',')
        ? current.toLocaleString('en-IN')
        : String(current);
      setDisplayed(`${prefix}${formatted}${suffix}`);

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center px-2">
      <p className="font-display text-4xl font-medium tabular-nums text-gold-300 sm:text-5xl">{displayed}</p>
      <span className="mx-auto mt-3 block h-px w-8 bg-gold-400/40" aria-hidden="true" />
      <p className="mt-3 text-[11px] font-medium uppercase tracking-wider-luxe text-navy-200 sm:text-xs">{label}</p>
    </div>
  );
}
