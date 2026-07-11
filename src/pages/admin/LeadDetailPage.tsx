import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useLead, useUpdateLead } from '@/hooks/useLeads';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { leadUpdateSchema, type LeadUpdateFormValues } from '@/components/forms/formSchemas';
import { ROUTES } from '@/constants/routes';
import { LEAD_STAGE_LABELS, LEAD_PRIORITY_LABELS, LEAD_PRIORITY_TONE, LEAD_SOURCE_LABELS } from '@/constants/ui';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { normaliseError } from '@/utils/errors';
import { Phone, Mail, Calendar, Building2, ExternalLink } from 'lucide-react';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const { data: lead, isLoading, error, refetch } = useLead(id ?? '');
  const { mutate: updateLead, isPending: isSaving } = useUpdateLead();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<LeadUpdateFormValues>({
    resolver: zodResolver(leadUpdateSchema),
  });

  useEffect(() => {
    if (lead) {
      reset({
        stage:          lead.stage,
        priority:       lead.priority,
        assigned_to:    lead.assigned_to ?? '',
        admin_notes:    lead.admin_notes ?? '',
        follow_up_date: lead.follow_up_date ?? '',
      });
    }
  }, [lead, reset]);

  function onSubmit(values: LeadUpdateFormValues) {
    if (!id) return;
    updateLead({ id, patch: { ...values, follow_up_date: values.follow_up_date || null } }, {
      onSuccess: () => toast.success('Lead updated.'),
      onError:   (err) => toast.error(normaliseError(err)),
    });
  }

  return (
    <>
      <PageMeta title="Lead Detail | Admin" description="" noindex />

      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        isEmpty={!lead && !isLoading}
        emptyMessage="Lead not found."
        verbose
      >
        {lead && (
          <>
            <AdminPageHeader
              title={lead.full_name}
              subtitle={`Lead received ${formatDateTime(lead.created_at)}`}
              action={
                <Link to={ROUTES.admin.leads.list}>
                  <Button variant="outline" size="sm">← Back to Leads</Button>
                </Link>
              }
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Contact details */}
              <div className="space-y-4 lg:col-span-1">
                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                    Contact Info
                  </h2>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-navy-400" />
                      <a href={`tel:${lead.phone}`} className="font-medium text-navy-700 hover:underline">
                        {lead.phone}
                      </a>
                    </li>
                    {lead.email && (
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-navy-400" />
                        <a href={`mailto:${lead.email}`} className="text-navy-700 hover:underline">
                          {lead.email}
                        </a>
                      </li>
                    )}
                    {lead.preferred_contact && (
                      <li className="flex items-center gap-2 text-ink-secondary">
                        Prefers: <span className="capitalize">{lead.preferred_contact}</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                    Inquiry Details
                  </h2>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink-secondary">Source</dt>
                      <dd className="font-medium">{LEAD_SOURCE_LABELS[lead.source] ?? lead.source}</dd>
                    </div>
                    {lead.requirement_type && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Intent</dt>
                        <dd className="font-medium">{lead.requirement_type}</dd>
                      </div>
                    )}
                    {lead.timeline && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Timeline</dt>
                        <dd className="font-medium">{lead.timeline}</dd>
                      </div>
                    )}
                    {(lead.budget_min || lead.budget_max) && (
                      <div className="flex justify-between">
                        <dt className="text-ink-secondary">Budget</dt>
                        <dd className="font-medium text-xs">
                          {lead.budget_min ? `₹${(lead.budget_min / 100000).toFixed(0)}L` : '—'} –{' '}
                          {lead.budget_max ? `₹${(lead.budget_max / 100000).toFixed(0)}L` : '—'}
                        </dd>
                      </div>
                    )}
                    {lead.property_title && (
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-ink-secondary flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> Property
                        </dt>
                        <dd className="text-right">
                          <Link
                            to={ROUTES.properties.detail(lead.property_slug ?? '')}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-navy-600 hover:underline"
                          >
                            {lead.property_title}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {lead.message && (
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                      Message
                    </h2>
                    <p className="text-sm text-ink-secondary whitespace-pre-line">{lead.message}</p>
                  </div>
                )}

                {(lead.utm_source || lead.referrer_url) && (
                  <div className="rounded-lg border border-gray-200 bg-white p-5">
                    <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-secondary">
                      Traffic Source
                    </h2>
                    <dl className="space-y-1 text-xs text-ink-secondary">
                      {lead.utm_source && <div>UTM Source: <span className="text-ink-primary">{lead.utm_source}</span></div>}
                      {lead.utm_medium && <div>Medium: <span className="text-ink-primary">{lead.utm_medium}</span></div>}
                      {lead.utm_campaign && <div>Campaign: <span className="text-ink-primary">{lead.utm_campaign}</span></div>}
                      {lead.referrer_url && <div className="break-all">Referrer: <span className="text-ink-primary">{lead.referrer_url}</span></div>}
                    </dl>
                  </div>
                )}
              </div>

              {/* Right: Stage management form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <Badge tone={LEAD_PRIORITY_TONE[lead.priority]}>
                      {LEAD_PRIORITY_LABELS[lead.priority]}
                    </Badge>
                    <Badge tone={lead.stage === 'converted' ? 'green' : lead.stage === 'lost' ? 'red' : 'navy'}>
                      {LEAD_STAGE_LABELS[lead.stage]}
                    </Badge>
                    {lead.follow_up_date && (
                      <span className="flex items-center gap-1 text-xs text-ink-secondary">
                        <Calendar className="h-3 w-3" />
                        Follow-up: {formatDate(lead.follow_up_date)}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink-primary">Stage</label>
                      <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600" {...register('stage')}>
                        {Object.entries(LEAD_STAGE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-ink-primary">Priority</label>
                      <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-navy-600 focus:ring-1 focus:ring-navy-600" {...register('priority')}>
                        {Object.entries(LEAD_PRIORITY_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Assigned To"
                      placeholder="Team member name"
                      {...register('assigned_to')}
                    />
                    <Input
                      label="Follow-up Date"
                      type="date"
                      {...register('follow_up_date')}
                    />
                  </div>

                  <div className="mt-4">
                    <Textarea
                      label="Admin Notes"
                      rows={5}
                      placeholder="Add call notes, follow-up actions, site visit details…"
                      {...register('admin_notes')}
                    />
                  </div>

                  <div className="mt-4">
                    <Button type="submit" isLoading={isSaving} disabled={!isDirty}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </QueryBoundary>
    </>
  );
}
