/**
 * Admin Dashboard — architecture shell.
 *
 * Layout:
 *   Row 1: 4 property stats (active, sold, draft, featured)
 *   Row 2: 4 entity counts (projects, team, upcoming events, published posts)
 *   Row 3: 5 lead metrics (total, new, this week, follow-ups today, unseen)
 *   Row 4: Two columns — leads source bar chart + follow-up list
 *
 * Data:
 *   - useDashboardStats() → admin_dashboard_stats view (auto-refresh 30s)
 *   - useSourceAnalytics() → leads_source_analytics view
 *   - useLeads({ followUpToday: true }) → today's follow-up leads
 *
 * Per master context section 11: dashboard is the first screen after login.
 * Stats are real counts from DB views, never mocked.
 *
 * Page implementation is Phase 4 — this file defines the component
 * interface, data wiring, and layout structure for Phase 4 to fill in.
 */

import { Link } from 'react-router-dom';
import {
  Building2, FolderKanban, Users, CalendarDays,
  Newspaper, Inbox, Star, Clock, TrendingUp, Eye,
} from 'lucide-react';
import { useDashboardStats, useLeads, useSourceAnalytics } from '@/hooks/useLeads';
import { StatCard } from '@/components/shared/StatCard';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { Badge, statusToTone } from '@/components/ui/Badge';
import { PageMeta } from '@/components/ui/PageMeta';
import { ROUTES } from '@/constants/routes';
import { LEAD_STAGE_LABELS, LEAD_PRIORITY_LABELS, LEAD_PRIORITY_TONE } from '@/constants/ui';
import { timeAgo } from '@/utils/formatters';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useDashboardStats();
  const { data: analytics, isLoading: analyticsLoading } = useSourceAnalytics();
  const { data: followUps, isLoading: followUpsLoading } = useLeads({ followUpToday: true, pageSize: 10 });
  const { data: newLeads, isLoading: newLeadsLoading } = useLeads({ stage: 'new', pageSize: 5 });

  return (
    <>
      <PageMeta title="Dashboard | HK Grow Infra Admin" description="Admin dashboard." noindex />
      <AdminPageHeader
        title="Dashboard"
        subtitle={`Welcome back. Last updated ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
      />

      <QueryBoundary
        isLoading={statsLoading}
        error={statsError}
        onRetry={refetch}
        verbose
        loadingVariant="skeleton-cards"
        skeletonCount={4}
      >
        {/* ── Row 1: Property stats ─────────────────────────────────────────── */}
        <section aria-label="Property statistics" className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Properties
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Listings"
              value={stats?.active_properties}
              icon={<Building2 className="h-6 w-6" />}
              tone="green"
              isLoading={statsLoading}
            />
            <StatCard
              label="Sold"
              value={stats?.sold_properties}
              icon={<Building2 className="h-6 w-6" />}
              tone="gray"
              isLoading={statsLoading}
            />
            <StatCard
              label="Drafts"
              value={stats?.draft_properties}
              icon={<Building2 className="h-6 w-6" />}
              tone="amber"
              isLoading={statsLoading}
            />
            <StatCard
              label="Featured"
              value={stats?.featured_properties}
              icon={<Star className="h-6 w-6" />}
              tone="gold"
              isLoading={statsLoading}
            />
          </div>
        </section>

        {/* ── Row 2: Entity counts ──────────────────────────────────────────── */}
        <section aria-label="Content statistics" className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Content
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Projects"
              value={stats?.active_projects}
              icon={<FolderKanban className="h-6 w-6" />}
              tone="navy"
              isLoading={statsLoading}
            />
            <StatCard
              label="Team Members"
              value={stats?.team_members_count}
              icon={<Users className="h-6 w-6" />}
              tone="navy"
              isLoading={statsLoading}
            />
            <StatCard
              label="Upcoming Events"
              value={stats?.upcoming_events}
              icon={<CalendarDays className="h-6 w-6" />}
              tone="navy"
              isLoading={statsLoading}
            />
            <StatCard
              label="Published Posts"
              value={stats?.published_posts}
              icon={<Newspaper className="h-6 w-6" />}
              tone="navy"
              isLoading={statsLoading}
            />
          </div>
        </section>

        {/* ── Row 3: Lead metrics ───────────────────────────────────────────── */}
        <section aria-label="Lead statistics" className="mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            Leads
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              label="Total Leads"
              value={stats?.total_leads}
              icon={<Inbox className="h-6 w-6" />}
              tone="navy"
              isLoading={statsLoading}
            />
            <StatCard
              label="New"
              value={stats?.new_leads}
              icon={<TrendingUp className="h-6 w-6" />}
              tone="green"
              isLoading={statsLoading}
            />
            <StatCard
              label="This Week"
              value={stats?.leads_this_week}
              icon={<TrendingUp className="h-6 w-6" />}
              tone="navy"
              isLoading={statsLoading}
            />
            <StatCard
              label="Follow-ups Today"
              value={stats?.follow_ups_today}
              icon={<Clock className="h-6 w-6" />}
              tone={stats?.follow_ups_today ? 'amber' : 'gray'}
              isLoading={statsLoading}
            />
            <StatCard
              label="Unseen"
              value={stats?.unseen_leads}
              icon={<Eye className="h-6 w-6" />}
              tone={stats?.unseen_leads ? 'red' : 'gray'}
              isLoading={statsLoading}
            />
          </div>
        </section>

        {/* ── Row 4: Follow-ups + New leads ────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Follow-ups today */}
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-navy-800">Follow-ups Today</h2>
              <Link
                to={ROUTES.admin.leads.list}
                className="text-xs font-medium text-navy-600 hover:underline"
              >
                View all leads →
              </Link>
            </div>
            <QueryBoundary
              isLoading={followUpsLoading}
              error={null}
              isEmpty={!followUps?.data.length}
              emptyMessage="No follow-ups scheduled for today."
              loadingVariant="skeleton-list"
              skeletonCount={3}
            >
              <ul className="divide-y divide-gray-50">
                {followUps?.data.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={ROUTES.admin.leads.detail(lead.id)}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-800">{lead.full_name}</p>
                        <p className="text-xs text-ink-secondary">{lead.phone}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge tone={LEAD_PRIORITY_TONE[lead.priority]}>
                          {LEAD_PRIORITY_LABELS[lead.priority]}
                        </Badge>
                        <Badge tone={statusToTone(lead.stage)}>
                          {LEAD_STAGE_LABELS[lead.stage]}
                        </Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </QueryBoundary>
          </section>

          {/* Newest leads */}
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-navy-800">Latest Inquiries</h2>
              <Link
                to={ROUTES.admin.leads.list}
                className="text-xs font-medium text-navy-600 hover:underline"
              >
                View all →
              </Link>
            </div>
            <QueryBoundary
              isLoading={newLeadsLoading}
              error={null}
              isEmpty={!newLeads?.data.length}
              emptyMessage="No new leads yet."
              loadingVariant="skeleton-list"
              skeletonCount={3}
            >
              <ul className="divide-y divide-gray-50">
                {newLeads?.data.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={ROUTES.admin.leads.detail(lead.id)}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-navy-800">{lead.full_name}</p>
                        <p className="truncate text-xs text-ink-secondary">
                          {lead.source.replace(/_/g, ' ')} · {timeAgo(lead.created_at)}
                        </p>
                      </div>
                      <Badge tone="green" className="shrink-0">New</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </QueryBoundary>
          </section>
        </div>

        {/* ── Source analytics ─────────────────────────────────────────────── */}
        {!analyticsLoading && analytics && analytics.length > 0 && (
          <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-navy-800">Leads by Source</h2>
            <div className="space-y-3">
              {analytics.map((row) => {
                const pct = Math.round((row.total_leads / (analytics[0]?.total_leads || 1)) * 100);
                return (
                  <div key={row.source} className="flex items-center gap-4">
                    <span className="w-36 shrink-0 text-sm text-ink-secondary">
                      {row.source.replace(/_/g, ' ')}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2">
                      <div
                        className="h-2 rounded-full bg-navy-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm font-medium text-navy-700">
                      {row.total_leads} <span className="font-normal text-ink-secondary">({row.conversion_rate_pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </QueryBoundary>
    </>
  );
}
