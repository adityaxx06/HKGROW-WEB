import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  maxTags?: number;
}

/**
 * Multi-value tag input used for:
 *   - property.amenities
 *   - project.highlights
 *   - blog_posts.tags
 *   - leads.tags (admin)
 *
 * Press Enter or comma to add a tag; click × to remove.
 */
export function TagInput({
  label,
  value,
  onChange,
  placeholder = 'Type and press Enter…',
  hint,
  error,
  maxTags = 20,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || value.includes(tag) || value.length >= maxTags) return;
    onChange([...value, tag]);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const id = label?.toLowerCase().replace(/\s+/g, '-') ?? 'tag-input';

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-primary">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={clsx(
          'flex min-h-[42px] w-full flex-wrap gap-1.5 rounded-md border px-3 py-2 cursor-text',
          'focus-within:border-navy-600 focus-within:ring-1 focus-within:ring-navy-600',
          error ? 'border-red-500' : 'border-gray-300'
        )}
      >
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              aria-label={`Remove ${tag}`}
              className="rounded-full hover:text-navy-900"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-secondary focus:outline-none"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-secondary">{hint}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
