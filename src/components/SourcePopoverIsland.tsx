import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ResolvedSource {
  id: string;
  interviewId: string;
  interviewTitle: string;
  people: { id: string; name: string }[];
  quote?: string;
  timestamp?: string;
}

export default function SourcePopoverIsland({ sources }: { sources: ResolvedSource[] }) {
  if (sources.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`${sources.length} fuente${sources.length === 1 ? '' : 's'}`}
        className="bg-muted text-foreground hover:bg-accent hover:text-accent-foreground mx-0.5 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 align-super text-[0.6rem] font-semibold"
      >
        {sources.length}
      </PopoverTrigger>
      <PopoverContent>
        <ul className="flex flex-col gap-3">
          {sources.map((source) => (
            <li key={source.id} className="flex flex-col gap-1">
              <div className="text-sm font-medium">
                {source.people.map((person, index) => (
                  <span key={person.id}>
                    {index > 0 && ', '}
                    <a className="underline" href={`/people/${person.id}/`}>
                      {person.name}
                    </a>
                  </span>
                ))}
              </div>
              <a className="text-muted-foreground text-sm underline" href={`/interviews/${source.interviewId}/`}>
                {source.interviewTitle}
                {source.timestamp ? ` (${source.timestamp})` : ''}
              </a>
              {source.quote && (
                <blockquote className="border-border text-muted-foreground border-l-2 pl-2 text-sm italic">
                  &ldquo;{source.quote}&rdquo;
                </blockquote>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
