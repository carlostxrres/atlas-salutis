import { IconBrandYoutube, IconCalendar, IconClock, type Icon } from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';

export interface InterviewMetaProps {
  channel: string;
  /** Human-readable date, already localised by the caller (`es-ES`). */
  dateLabel: string;
  /** ISO `YYYY-MM-DD`, for the `<time datetime>` attribute. */
  dateISO: string;
  durationMinutes?: number;
}

interface MetaItem {
  icon: Icon;
  /** Read out by screen readers in place of the icon, which is decorative. */
  label: string;
  value: string;
  dateTime?: string;
}

function MetaEntry({ item }: { item: MetaItem }) {
  const { icon: IconComponent, label, value, dateTime } = item;
  const Value = dateTime ? 'time' : 'span';

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <IconComponent className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}:</span>
      <Value className="text-foreground text-sm" {...(dateTime ? { dateTime } : {})}>
        {value}
      </Value>
    </div>
  );
}

export default function InterviewMeta({ channel, dateLabel, dateISO, durationMinutes }: InterviewMetaProps) {
  const items: MetaItem[] = [
    { icon: IconBrandYoutube, label: 'Canal', value: channel },
    { icon: IconCalendar, label: 'Fecha', value: dateLabel, dateTime: dateISO },
  ];

  if (durationMinutes !== undefined) {
    items.push({ icon: IconClock, label: 'Duración', value: `${durationMinutes} min` });
  }

  return (
    <div className="not-content mb-6">
      {/* `w-fit` keeps the pill hugging its contents instead of spanning the
          column; `flex-wrap` lets it break onto a second line on narrow
          viewports, where the dividers simply wrap with the entries. */}
      <div className="border-border bg-card flex w-fit flex-wrap items-center rounded-full border">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center self-stretch">
            {index > 0 && <Separator orientation="vertical" className="my-1.5" />}
            <MetaEntry item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
