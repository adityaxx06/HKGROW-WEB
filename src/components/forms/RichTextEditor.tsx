/**
 * RichTextEditor — TipTap wrapper for blog post and legal page content.
 *
 * Toolbar: Bold, Italic, Heading levels (H2, H3), bullet list, ordered list,
 * blockquote, link, hard break, clear marks.
 *
 * Output: HTML string — stored in blog_posts.content / legal_pages.content.
 * Sanitised via DOMPurify (sanitise.ts) before any public render.
 *
 * Per section 7 architecture: editor is used admin-side only. Output is
 * always passed through safeHtml() on the public site.
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Quote,
  Heading2, Heading3, Minus,
} from 'lucide-react';
import { clsx } from 'clsx';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing…',
  minHeight = '300px',
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3',
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  // Sync external value changes (e.g. when loading a draft into the editor)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={clsx('rounded-md border', error ? 'border-red-500' : 'border-gray-300')}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-gray-200 bg-gray-50 p-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          aria-label="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          aria-label="Ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          aria-label="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          aria-label="Horizontal rule"
        >
          <Minus className="h-4 w-4" />
        </ToolButton>
      </div>

      {/* Editor content area */}
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="cursor-text"
      />

      {error && <p className="border-t border-gray-200 px-4 py-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function ToolButton({
  onClick,
  active,
  children,
  'aria-label': ariaLabel,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
  'aria-label': string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={clsx(
        'rounded p-2 transition-colors',
        active
          ? 'bg-navy-100 text-navy-700'
          : 'text-ink-secondary hover:bg-gray-100 hover:text-ink-primary'
      )}
    >
      {children}
    </button>
  );
}
