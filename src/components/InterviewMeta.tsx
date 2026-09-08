import { IconBrandYoutube, IconCalendar, IconClock, type Icon } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Both sizes render the same pill — a bordered, rounded container whose
// entries are split by vertical dividers — so the interview page and the
// listing cards read as the same object. Only the scale changes: 'sm' is the
// version that sits inside a card.
export type InterviewMetaSize = 'default' | 'sm';

export interface InterviewMetaProps {
  channel: string;
  /** Human-readable date, already localised by the caller (`es-ES`). */
  dateLabel: string;
  /** ISO `YYYY-MM-DD`, for the `<time datetime>` attribute. */
  dateISO: string;
  durationMinutes?: number;
  size?: InterviewMetaSize;
  className?: string;
}

interface MetaItem {
  icon: Icon;
  /** Read out by screen readers in place of the icon, which is decorative. */
  label: string;
  value: string;
  dateTime?: string;
}

function MetaEntry({ item, size }: { item: MetaItem; size: InterviewMetaSize }) {
  const { icon: IconComponent, label, value, dateTime } = item;
  const Value = dateTime ? 'time' : 'span';
  const isDefault = size === 'default';

  return (
    <div className={cn('flex items-center gap-1.5', isDefault ? 'px-3 py-1.5' : 'px-2.5 py-1')}>
      <IconComponent
        className={cn('text-muted-foreground shrink-0', isDefault ? 'size-4' : 'size-3.5')}
        aria-hidden="true"
      />
      <span className="sr-only">{label}:</span>
      <Value
        className={cn(isDefault ? 'text-foreground text-sm' : 'text-muted-foreground text-xs')}
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
  size = 'default',
  className,
}: InterviewMetaProps) {
  const items: MetaItem[] = [
    { icon: IconBrandYoutube, label: 'Canal', value: channel },
    { icon: IconCalendar, label: 'Fecha', value: dateLabel, dateTime: dateISO },
  ];

  if (durationMinutes !== undefined) {
    items.push({ icon: IconClock, label: 'Duración', value: `${durationMinutes} min` });
  }

  return (
    // `w-fit` keeps the pill hugging its contents instead of spanning the
    // column; `flex-wrap` lets it break onto a second line on narrow
    // viewports, where the dividers simply wrap with the entries.
    <div
      className={cn(
        'not-content border-border bg-card flex w-fit flex-wrap items-center rounded-full border',
        size === 'default' && 'mb-6',
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center self-stretch">
          {index > 0 && <Separator orientation="vertical" className={size === 'default' ? 'my-1.5' : 'my-1'} />}
          <MetaEntry item={item} size={size} />
        </div>
      ))}
    </div>
  );
}
