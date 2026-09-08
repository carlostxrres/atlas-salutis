import { IconBrandYoutube, IconCalendar, IconClock, type Icon } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// 'pill' is the interview page header: a bordered, rounded container.
// 'inline' is the same data stripped of its chrome, for use inside a card
// that already has a border of its own — see `InterviewsSearch`.
export type InterviewMetaVariant = 'pill' | 'inline';

export interface InterviewMetaProps {
  channel: string;
  /** Human-readable date, already localised by the caller (`es-ES`). */
  dateLabel: string;
  /** ISO `YYYY-MM-DD`, for the `<time datetime>` attribute. */
  dateISO: string;
  durationMinutes?: number;
  variant?: InterviewMetaVariant;
  className?: string;
}

interface MetaItem {
  icon: Icon;
  /** Read out by screen readers in place of the icon, which is decorative. */
  label: string;
  value: string;
  dateTime?: string;
}

function MetaEntry({ item, variant }: { item: MetaItem; variant: InterviewMetaVariant }) {
  const { icon: IconComponent, label, value, dateTime } = item;
  const Value = dateTime ? 'time' : 'span';

  return (
    <div className={cn('flex items-center gap-1.5', variant === 'pill' ? 'px-3 py-1.5' : 'py-0.5')}>
      <IconComponent
        className={cn('text-muted-foreground shrink-0', variant === 'pill' ? 'size-4' : 'size-3.5')}
        aria-hidden="true"
      />
      <span className="sr-only">{label}:</span>
      <Value
        className={cn(variant === 'pill' ? 'text-foreground text-sm' : 'text-muted-foreground text-xs')}
        {...(dateTime ? { dateTime } : {})}
      >
        {value}
      </Value>
    </div>
  );
}

export default function InterviewMeta({
  channel,
  dateLabel,
  dateISO,
  durationMinutes,
  variant = 'pill',
  className,
}: InterviewMetaProps) {
  const items: MetaItem[] = [
    { icon: IconBrandYoutube, label: 'Canal', value: channel },
    { icon: IconCalendar, label: 'Fecha', value: dateLabel, dateTime: dateISO },
  ];

  if (durationMinutes !== undefined) {
    items.push({ icon: IconClock, label: 'Duración', value: `${durationMinutes} min` });
  }

  const entries = items.map((item, index) => (
    <div key={item.label} className="flex items-center self-stretch">
      {index > 0 && <Separator orientation="vertical" className={variant === 'pill' ? 'my-1.5' : 'my-1 mr-2 ml-2'} />}
      <MetaEntry item={item} variant={variant} />
    </div>
  ));

  if (variant === 'inline') {
    return <div className={cn('flex flex-wrap items-center', className)}>{entries}</div>;
  }

  return (
    <div className={cn('not-content mb-6', className)}>
      {/* `w-fit` keeps the pill hugging its contents instead of spanning the
          column; `flex-wrap` lets it break onto a second line on narrow
          viewports, where the dividers simply wrap with the entries. */}
      <div className="border-border bg-card flex w-fit flex-wrap items-center rounded-full border">{entries}</div>
    </div>
  );
}
