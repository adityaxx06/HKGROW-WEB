import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, History } from 'lucide-react';
import {
  useAdminLegalPages, useLegalPageHistory,
  useCreateLegalPageVersion, usePublishLegalPage, useDeleteLegalPageDraft,
} from '@/hooks/useLegal';
import { AdminPageHeader } from '@/components/shared/AdminPageHeader';
import { QueryBoundary } from '@/components/shared/QueryBoundary';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RichTextEditor } from '@/components/forms/RichTextEditor';
import { PageMeta } from '@/components/ui/PageMeta';
import { useToast } from '@/components/shared/Toast';
import { legalPageSchema, type LegalPageFormValues } from '@/components/forms/formSchemas';
import { normaliseError } from '@/utils/errors';
import { formatDate } from '@/utils/formatters';
import type { LegalPage, LegalPageKey } from '@/types/database';

const PAGE_KEYS: LegalPageKey[] = ['terms', 'privacy', 'disclaimer'];
const PAGE_KEY_LABELS: Record<LegalPageKey, string> = {
  terms:      'Terms & Conditions',
  privacy:    'Privacy Policy',
  disclaimer: 'Disclaimer',
  refund:     'Refund Policy',
};

export function LegalPagesPage() {
  const toast = useToast();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LegalPage | null>(null);
  const [historyKey, setHistoryKey] = useState<LegalPageKey | null>(null);
  const [publishId, setPublishId] = useState<{ id: string; key: LegalPageKey } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useAdminLegalPages();
  const { data: history } = useLegalPageHistory(historyKey ?? 'terms');
  const { mutate: createVersion, isPending: isCreating } = useCreateLegalPageVersion();
  const { mutate: publish, isPending: isPublishing } = usePublishLegalPage();
  const { mutate: deleteDraft, isPending: isDeletingDraft } = useDeleteLegalPageDraft();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<LegalPageFormValues>({
    resolver: zodResolver(legalPageSchema),
  });

  function openNew(key: LegalPageKey) {
    reset({ page_key: key, title: PAGE_KEY_LABELS[key], content: '', change_summary: '' });
    setEditTarget(null);
    setEditorOpen(true);
  }

  function openEdit(page: LegalPage) {
    reset({
      page_key:       page.page_key,
      title:          page.title,
      content:        page.content,
      change_summary: page.change_summary ?? '',
    });
    setEditTarget(page);
    setEditorOpen(true);
  }

  function onSubmit(values: LegalPageFormValues) {
    if (editTarget) {
      // Can only edit drafts (enforced by DB policy too)
      toast.error('To edit a published page, create a new version instead.');
      return;
    }
    // Get current published version number to increment
    const existing = data?.filter((p) => p.page_key === values.page_key) ?? [];
    const maxVersion = Math.max(0, ...existing.map((p) => p.version));
    createVersion({ ...values, version: maxVersion + 1, status: 'draft' }, {
      onSuccess: () => { toast.success('Draft created.'); setEditorOpen(false); },
      onError: (err) => toast.error(normaliseError(err)),
    });
  }

  // Group by page_key to show one section per legal page
  const grouped = PAGE_KEYS.map((key) => ({
    key,
    label: PAGE_KEY_LABELS[key],
    published: data?.find((p) => p.page_key === key && p.status === 'published'),
    drafts: data?.filter((p) => p.page_key === key && p.status === 'draft') ?? [],
  }));

  return (
    <>
      <PageMeta title="Legal Pages | Admin" description="" noindex />
      <AdminPageHeader title="Legal Pages" subtitle="Terms, Privacy Policy, Disclaimer — with version history." />

      <QueryBoundary isLoading={isLoading} error={error} onRetry={refetch} verbose>
        <div className="space-y-6">
          {grouped.map(({ key, label, published, drafts }) => (
            <div key={key} className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-navy-800">{label}</h2>
                  {published && (
                    <p className="text-xs text-ink-secondary">
                      v{published.version} published · effective {formatDate(published.effective_date)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryKey(historyKey === key ? null : key)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-secondary hover:bg-gray-100"
                  >
                    <History className="h-3 w-3" /> History
                  </button>
                  <Button size="sm" variant="outline" onClick={() => openNew(key)}>
                    <Plus className="h-3 w-3" /> New Draft
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {published && (
                  <div className="flex items-center justify-between px-5 py-3">
                    <div>
                      <Badge tone="green">Published v{published.version}</Badge>
                      <span className="ml-2 text-sm text-ink-secondary">{published.title}</span>
                    </div>
                    <span className="text-xs text-ink-secondary">
                      {published.change_summary ?? '—'}
                    </span>
                  </div>
                )}

                {drafts.map((draft) => (
                  <div key={draft.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <Badge tone="amber">Draft v{draft.version}</Badge>
                      <span className="ml-2 text-sm text-ink-secondary">{draft.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPublishId({ id: draft.id, key })}
                      >
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(draft)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(draft.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {!published && drafts.length === 0 && (
                  <p className="px-5 py-3 text-sm text-ink-secondary italic">No content yet — create a draft to get started.</p>
                )}
              </div>

              {/* Version history panel */}
              {historyKey === key && history && history.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">Version History</p>
                  <ul className="space-y-1">
                    {history.map((h) => (
                      <li key={h.id} className="flex items-center gap-3 text-xs text-ink-secondary">
                        <Badge tone={h.status === 'published' ? 'green' : h.status === 'archived' ? 'gray' : 'amber'}>
                          {h.status}
                        </Badge>
                        <span>v{h.version}</span>
                        <span>{formatDate(h.created_at)}</span>
                        <span className="flex-1 truncate">{h.change_summary ?? '—'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </QueryBoundary>

      {/* Draft editor modal */}
      <Modal isOpen={editorOpen} onClose={() => setEditorOpen(false)} title={editTarget ? 'Edit Draft' : 'New Draft Version'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-primary">Page</label>
              <select className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm" {...register('page_key')} disabled={!!editTarget}>
                {PAGE_KEYS.map((k) => <option key={k} value={k}>{PAGE_KEY_LABELS[k]}</option>)}
              </select>
            </div>
            <Input label="Title" required error={errors.title?.message} {...register('title')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-primary">Content <span className="text-red-600">*</span></label>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} minHeight="300px" />
              )}
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
          </div>
          <Input label="Change Summary" placeholder="What changed in this version?" {...register('change_summary')} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Save Draft</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!publishId} onClose={() => setPublishId(null)}
        onConfirm={() => {
          if (!publishId) return;
          publish(publishId, {
            onSuccess: () => { toast.success('Page published.'); setPublishId(null); },
            onError: (err) => { toast.error(normaliseError(err)); setPublishId(null); },
          });
        }}
        isLoading={isPublishing}
        title="Publish Legal Page"
        message="This will archive the current published version and make this draft live on the public site."
        confirmLabel="Publish" tone="warning"
      />

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          deleteDraft(deleteId, {
            onSuccess: () => { toast.success('Draft deleted.'); setDeleteId(null); },
            onError: (err) => { toast.error(normaliseError(err)); setDeleteId(null); },
          });
        }}
        isLoading={isDeletingDraft}
        title="Delete Draft"
        message="Permanently delete this draft? This cannot be undone."
        confirmLabel="Delete" tone="danger"
      />
    </>
  );
}
