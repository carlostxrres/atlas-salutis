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
        className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-200 px-1 align-super text-[0.65rem] font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
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
              <a className="text-sm text-slate-500 underline dark:text-slate-400" href={`/interviews/${source.interviewId}/`}>
                {source.interviewTitle}
                {source.timestamp ? ` (${source.timestamp})` : ''}
              </a>
              {source.quote && (
                <blockquote className="border-l-2 border-slate-300 pl-2 text-sm italic text-slate-600 dark:border-slate-600 dark:text-slate-300">
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
