/**
 * ContentEditorPage — Admin UI for editing homepage content blocks.
 *
 * Editable blocks:
 *   • hero      — badge, headline, subheading, CTA buttons
 *   • stats     — the 4 number stats (Happy Families, Projects Delivered, etc.)
 *   • why_us    — heading, subheading, and the 6 feature points
 *   • cta_banner — bottom CTA section heading, subheading, button text/URL
 *
 * Architecture: reads via useAdminContentBlocks('home'), writes via
 * useUpdateContentBlock — no new tables, no schema changes.
 */
import { useState, useEffect } from 'react';
import { useAdminContentBlocks, useUpdateContentBlock } from '@/hooks/useSettings';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { FormSection } from '@/components/forms/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { normaliseError } from '@/utils/errors';
import { Plus, Trash2, GripVertical, Info } from 'lucide-react';
import type { ContentBlock } from '@/types/database';

// ── helpers ───────────────────────────────────────────────────────────────────

function blockByKey(blocks: ContentBlock[], key: string) {
  return blocks.find((b) => b.section_key === key);
}

// ── Stat row ─────────────────────────────────────────────────────────────────

interface Stat { value: string; label: string }

function StatRow({
  stat,
  index,
  onChange,
  onDelete,
}: {
  stat: Stat;
  index: number;
  onChange: (i: number, field: keyof Stat, val: string) => void;
  onDelete: (i: number) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-gray-300" aria-hidden />
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <Input
          label="Number / Value"
          placeholder="500+"
          value={stat.value}
          onChange={(e) => onChange(index, 'value', e.target.value)}
          hint='e.g. "500+", "15+", "₹50Cr+"'
        />
        <Input
          label="Label"
          placeholder="Happy Families"
          value={stat.label}
          onChange={(e) => onChange(index, 'label', e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(index)}
        aria-label="Delete stat"
        className="mt-2 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Why-Us point row ──────────────────────────────────────────────────────────

interface WhyPoint { icon: string; title: string; description: string }

const ICON_OPTIONS = [
  'shield-check', 'map-pin', 'badge-indian-rupee',
  'hammer', 'headset', 'calendar-check',
  'star', 'home', 'check-circle', 'award',
];

function WhyPointRow({
  point,
  index,
  onChange,
  onDelete,
}: {
  point: WhyPoint;
  index: number;
  onChange: (i: number, field: keyof WhyPoint, val: string) => void;
  onDelete: (i: number) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
          Point {index + 1}
        </span>
        <button
          type="button"
          onClick={() => onDelete(index)}
          aria-label="Delete point"
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy-800">Icon</label>
          <select
            value={point.icon}
            onChange={(e) => onChange(index, 'icon', e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          >
            {ICON_OPTIONS.map((ic) => (
              <option key={ic} value={ic}>{ic}</option>
            ))}
          </select>
        </div>
        <Input
          label="Title"
          placeholder="RERA Registered"
          value={point.title}
          onChange={(e) => onChange(index, 'title', e.target.value)}
        />
        <Input
          label="Short Description"
          placeholder="Every project fully compliant…"
          value={point.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ContentEditorPage() {
  const toast = useToast();
  const { data: blocks, isLoading, error, refetch } = useAdminContentBlocks('home');
  const { mutate: updateBlock, isPending: isSaving } = useUpdateContentBlock();

  // ── local state for each block's content ──────────────────────────────────

  // hero
  const [hero, setHero] = useState({
    badge_text: '',
    heading: '',
    subheading: '',
    cta_primary_text: '',
    cta_primary_url: '',
    cta_secondary_text: '',
    cta_secondary_url: '',
  });

  // stats
  const [stats, setStats] = useState<Stat[]>([]);

  // why_us
  const [whyHeading, setWhyHeading]       = useState('');
  const [whySubheading, setWhySubheading] = useState('');
  const [whyPoints, setWhyPoints]         = useState<WhyPoint[]>([]);

  // cta_banner
  const [cta, setCta] = useState({
    heading: '',
    subheading: '',
    cta_text: '',
    cta_url: '',
  });

  // populate from loaded blocks
  useEffect(() => {
    if (!blocks) return;

    const heroBlock = blockByKey(blocks, 'hero');
    if (heroBlock) {
      const c = heroBlock.content as Record<string, string>;
      setHero({
        badge_text:         c.badge_text ?? '',
        heading:            c.heading ?? '',
        subheading:         c.subheading ?? '',
        cta_primary_text:   c.cta_primary_text ?? '',
        cta_primary_url:    c.cta_primary_url ?? '',
        cta_secondary_text: c.cta_secondary_text ?? '',
        cta_secondary_url:  c.cta_secondary_url ?? '',
      });
    }

    const statsBlock = blockByKey(blocks, 'stats');
    if (statsBlock) {
      const c = statsBlock.content as { stats?: Stat[] };
      setStats(c.stats ?? []);
    }

    const whyBlock = blockByKey(blocks, 'why_us');
    if (whyBlock) {
      const c = whyBlock.content as { heading?: string; subheading?: string; points?: WhyPoint[] };
      setWhyHeading(c.heading ?? '');
      setWhySubheading(c.subheading ?? '');
      setWhyPoints(c.points ?? []);
    }

    const ctaBlock = blockByKey(blocks, 'cta_banner');
    if (ctaBlock) {
      const c = ctaBlock.content as Record<string, string>;
      setCta({
        heading:    c.heading ?? '',
        subheading: c.subheading ?? '',
        cta_text:   c.cta_text ?? '',
        cta_url:    c.cta_url ?? '',
      });
    }
  }, [blocks]);

  // ── save helpers ──────────────────────────────────────────────────────────

  function saveBlock(key: string, content: Record<string, unknown>, label: string) {
    const block = blockByKey(blocks ?? [], key);
    if (!block) { toast.error(`Block "${key}" not found.`); return; }
    updateBlock(
      { id: block.id, patch: { content } },
      {
        onSuccess: () => toast.success(`${label} saved.`),
        onError:   (err) => toast.error(normaliseError(err)),
      },
    );
  }

  // stat helpers
  function updateStat(i: number, field: keyof Stat, val: string) {
    setStats((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  }
  function deleteStat(i: number) {
    setStats((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addStat() {
    setStats((prev) => [...prev, { value: '0+', label: 'New Stat' }]);
  }

  // why_us helpers
  function updatePoint(i: number, field: keyof WhyPoint, val: string) {
    setWhyPoints((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }
  function deletePoint(i: number) {
    setWhyPoints((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addPoint() {
    setWhyPoints((prev) => [
      ...prev,
      { icon: 'shield-check', title: 'New Feature', description: 'Brief description here.' },
    ]);
  }

  return (
    <>
      <PageMeta title="Content Editor | Admin" description="" noindex />
      <AdminPageHeader
        title="Homepage Content Editor"
        subtitle="Edit the hero text, statistics, features section, and call-to-action — all without touching code."
      />

      <QueryBoundary isLoading={isLoading} error={error} onRetry={refetch} verbose>

        {/* ── INFO BANNER ── */}
        <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <p>
            Each section has its own <strong>Save</strong> button. Changes go live on the public website
            immediately after saving — no deployment needed.
          </p>
        </div>

        <div className="space-y-0">

          {/* ════════════════════════════════════════════════════════════════
              1. HERO SECTION
          ════════════════════════════════════════════════════════════════ */}
          <FormSection
            title="Hero Section"
            description="The large banner at the very top of the homepage — headline, subheading, and the two call-to-action buttons."
          >
            <Input
              label="Badge Text"
              placeholder="RERA Registered · Prayagraj's Trusted Builder"
              value={hero.badge_text}
              onChange={(e) => setHero((h) => ({ ...h, badge_text: e.target.value }))}
              hint="Small label shown above the headline. Leave blank to hide."
            />
            <div className="col-span-full">
              <Textarea
                label="Main Headline"
                rows={2}
                placeholder="Building Dreams, Delivering Trust"
                value={hero.heading}
                onChange={(e) => setHero((h) => ({ ...h, heading: e.target.value }))}
                hint="The large bold headline. Keep it under 60 characters for best display."
              />
            </div>
            <div className="col-span-full">
              <Textarea
                label="Subheading"
                rows={2}
                placeholder="Premium RERA-registered properties in Prayagraj"
                value={hero.subheading}
                onChange={(e) => setHero((h) => ({ ...h, subheading: e.target.value }))}
                hint="One or two sentences shown below the headline."
              />
            </div>
            <Input
              label="Primary Button Text"
              placeholder="Explore Properties"
              value={hero.cta_primary_text}
              onChange={(e) => setHero((h) => ({ ...h, cta_primary_text: e.target.value }))}
            />
            <Input
              label="Primary Button URL"
              placeholder="/properties"
              value={hero.cta_primary_url}
              onChange={(e) => setHero((h) => ({ ...h, cta_primary_url: e.target.value }))}
            />
            <Input
              label="Secondary Button Text"
              placeholder="Book Free Consultation"
              value={hero.cta_secondary_text}
              onChange={(e) => setHero((h) => ({ ...h, cta_secondary_text: e.target.value }))}
            />
            <Input
              label="Secondary Button URL"
              placeholder="/contact"
              value={hero.cta_secondary_url}
              onChange={(e) => setHero((h) => ({ ...h, cta_secondary_url: e.target.value }))}
            />
            <div className="col-span-full pt-2">
              <Button
                type="button"
                isLoading={isSaving}
                onClick={() => saveBlock('hero', hero, 'Hero section')}
              >
                Save Hero Section
              </Button>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════════════════
              2. STATISTICS BAR
          ════════════════════════════════════════════════════════════════ */}
          <FormSection
            title="Statistics Bar"
            description='The 4 highlighted numbers shown on the dark navy band — "Happy Families", "Projects Delivered", "Years of Trust", "Acres Developed". You can rename them or change the numbers here.'
          >
            <div className="col-span-full space-y-3">
              {stats.map((stat, i) => (
                <StatRow
                  key={i}
                  stat={stat}
                  index={i}
                  onChange={updateStat}
                  onDelete={deleteStat}
                />
              ))}

              <button
                type="button"
                onClick={addStat}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-navy-400 hover:text-navy-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Another Stat
              </button>
            </div>

            <div className="col-span-full rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              <strong>Tip:</strong> Use suffixes like <code>+</code>, <code>Cr+</code>, or <code>%</code> in the value — e.g. <code>500+</code>, <code>₹50Cr+</code>, <code>98%</code>.
            </div>

            <div className="col-span-full pt-2">
              <Button
                type="button"
                isLoading={isSaving}
                onClick={() => saveBlock('stats', { stats }, 'Stats bar')}
              >
                Save Statistics
              </Button>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════════════════
              3. WHY CHOOSE US
          ════════════════════════════════════════════════════════════════ */}
          <FormSection
            title='"Why Choose Us" Section'
            description="The grid of feature cards in the middle of the homepage. Edit the heading, subheading, and each card's title and description."
          >
            <Input
              label="Section Heading"
              placeholder="Why Choose HK Grow Infra"
              value={whyHeading}
              onChange={(e) => setWhyHeading(e.target.value)}
            />
            <Input
              label="Section Subheading"
              placeholder="A real estate partner you can trust, from booking to possession."
              value={whySubheading}
              onChange={(e) => setWhySubheading(e.target.value)}
            />

            <div className="col-span-full space-y-3">
              <p className="text-sm font-medium text-navy-800">Feature Cards</p>
              {whyPoints.map((point, i) => (
                <WhyPointRow
                  key={i}
                  point={point}
                  index={i}
                  onChange={updatePoint}
                  onDelete={deletePoint}
                />
              ))}
              <button
                type="button"
                onClick={addPoint}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 hover:border-navy-400 hover:text-navy-600 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Feature Card
              </button>
            </div>

            <div className="col-span-full pt-2">
              <Button
                type="button"
                isLoading={isSaving}
                onClick={() =>
                  saveBlock(
                    'why_us',
                    { heading: whyHeading, subheading: whySubheading, points: whyPoints },
                    '"Why Choose Us" section',
                  )
                }
              >
                Save "Why Choose Us"
              </Button>
            </div>
          </FormSection>

          {/* ════════════════════════════════════════════════════════════════
              4. CTA BANNER
          ════════════════════════════════════════════════════════════════ */}
          <FormSection
            title="Bottom Call-to-Action Banner"
            description='The dark navy banner at the bottom of the homepage with the "Book Free Consultation" button.'
          >
            <div className="col-span-full">
              <Input
                label="Heading"
                placeholder="Ready to find your perfect property in Prayagraj?"
                value={cta.heading}
                onChange={(e) => setCta((c) => ({ ...c, heading: e.target.value }))}
              />
            </div>
            <div className="col-span-full">
              <Input
                label="Subheading"
                placeholder="Book a free consultation with our team today."
                value={cta.subheading}
                onChange={(e) => setCta((c) => ({ ...c, subheading: e.target.value }))}
              />
            </div>
            <Input
              label="Button Text"
              placeholder="Book Free Consultation"
              value={cta.cta_text}
              onChange={(e) => setCta((c) => ({ ...c, cta_text: e.target.value }))}
            />
            <Input
              label="Button URL"
              placeholder="/contact"
              value={cta.cta_url}
              onChange={(e) => setCta((c) => ({ ...c, cta_url: e.target.value }))}
            />
            <div className="col-span-full pt-2">
              <Button
                type="button"
                isLoading={isSaving}
                onClick={() => saveBlock('cta_banner', cta, 'CTA banner')}
              >
                Save CTA Banner
              </Button>
            </div>
          </FormSection>

        </div>
      </QueryBoundary>
    </>
  );
}
