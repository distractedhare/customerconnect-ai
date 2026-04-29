interface LearnTagGroupProps {
  label: string;
  tags: string[];
  tone?: 'magenta' | 'neutral' | 'info' | 'success';
  className?: string;
}

const TONE_STYLES = {
  magenta: {
    label: 'text-t-magenta',
    chip: 'border-t-magenta/20 bg-t-magenta/8 text-t-magenta',
  },
  neutral: {
    label: 'text-t-muted',
    chip: 'border-t-light-gray bg-t-light-gray/25 text-t-dark-gray',
  },
  info: {
    label: 'text-info-foreground',
    chip: 'border-info-border bg-info-surface text-info-foreground',
  },
  success: {
    label: 'text-success-foreground',
    chip: 'border-success-border bg-success-surface text-success-foreground',
  },
} as const;

function uniqueTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)));
}

export default function LearnTagGroup({
  label,
  tags,
  tone = 'neutral',
  className = '',
}: LearnTagGroupProps) {
  const visibleTags = uniqueTags(tags).slice(0, 4);

  if (visibleTags.length === 0) return null;

  const styles = TONE_STYLES[tone];

  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <p className={`text-[8px] font-black uppercase tracking-[0.18em] ${styles.label}`}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map(tag => (
          <span
            key={tag}
            className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] ${styles.chip}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
