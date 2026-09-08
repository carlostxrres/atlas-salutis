import { useMemo, useState } from 'react';
import { IconBrandYoutube, IconSearchOff } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyMedia, EmptyDescription } from '@/components/ui/empty';
import InterviewMeta from '@/components/InterviewMeta';
import { cn } from '@/lib/utils';

export interface InterviewSummary {
  id: string;
  title: string;
  channel: string;
  /** ISO `YYYY-MM-DD`: sort key and `<time datetime>` value. */
  date: string;
  /** Localised date, as shown on the card. */
  dateLabel: string;
  durationMinutes?: number;
  /** Absent when the interview's url has no resolvable video id. */
  thumbnail?: string;
  /** Short, single-line lead-in; see `excerpt()`. */
  excerpt: string;
}

function ChannelFilter({
  channels,
  selected,
  onToggle,
}: {
  channels: string[];
  selected: Set<string>;
  onToggle: (channel: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {channels.map((channel) => {
        const isActive = selected.has(channel);
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onToggle(channel)}
            aria-pressed={isActive}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-ring hover:text-foreground',
            )}
          >
            {channel}
          </button>
        );
      })}
    </div>
  );
}

function InterviewCard({ interview }: { interview: InterviewSummary }) {
  return (
    <a href={`/interviews/${interview.id}/`} className="block no-underline">
      <Card className="hover:border-ring transition-colors">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="bg-muted aspect-video w-full shrink-0 overflow-hidden rounded-md sm:w-48">
            {interview.thumbnail ? (
              <img
                src={interview.thumbnail}
                alt=""
                loading="lazy"
                width={320}
                height={180}
                className="size-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex size-full items-center justify-center">
                <IconBrandYoutube className="size-8" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <CardTitle className="text-base leading-snug">{interview.title}</CardTitle>

            <InterviewMeta
              size="sm"
              className="my-0.5"
              channel={interview.channel}
              dateLabel={interview.dateLabel}
              dateISO={interview.date}
              durationMinutes={interview.durationMinutes}
            />

            <p className="text-muted-foreground line-clamp-2 text-sm">{interview.excerpt}</p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default function InterviewsSearch({ interviews }: { interviews: InterviewSummary[] }) {
  const [query, setQuery] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  const channels = useMemo(
    () => [...new Set(interviews.map((interview) => interview.channel))].sort((a, b) => a.localeCompare(b)),
    [interviews],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return interviews.filter((interview) => {
      // An empty selection means "every channel", so the chips start as a
      // no-op rather than hiding everything.
      const matchesChannel = selectedChannels.size === 0 || selectedChannels.has(interview.channel);
      const matchesQuery =
        !q || interview.title.toLowerCase().includes(q) || interview.channel.toLowerCase().includes(q);
      return matchesChannel && matchesQuery;
    });
  }, [interviews, query, selectedChannels]);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((current) => {
      const next = new Set(current);
      if (!next.delete(channel)) next.add(channel);
      return next;
    });
  };

  return (
    <div className="not-content flex flex-col gap-4">
      <Input
        type="search"
        placeholder="Buscar por título o canal..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Buscar entrevistas"
      />

      <ChannelFilter channels={channels} selected={selectedChannels} onToggle={toggleChannel} />

      <p className="text-muted-foreground text-xs" aria-live="polite">
        {filtered.length === interviews.length
          ? `${interviews.length} entrevistas`
          : `${filtered.length} de ${interviews.length} entrevistas`}
      </p>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconSearchOff />
            </EmptyMedia>
            <EmptyDescription>
              No se encontraron entrevistas con esos criterios. Prueba con otro término o quita algún filtro de canal.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
}
