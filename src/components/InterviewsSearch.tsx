import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export interface InterviewSummary {
  id: string;
  title: string;
  channel: string;
  date: string;
  summary: string;
}

export default function InterviewsSearch({ interviews }: { interviews: InterviewSummary[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return interviews;
    return interviews.filter(
      (interview) =>
        interview.title.toLowerCase().includes(q) || interview.channel.toLowerCase().includes(q),
    );
  }, [interviews, query]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder="Buscar por título o canal..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Buscar entrevistas"
      />
      <div className="grid gap-3">
        {filtered.map((interview) => (
          <a key={interview.id} href={`/interviews/${interview.id}/`}>
            <Card className="transition-colors hover:border-slate-400 dark:hover:border-slate-500">
              <CardContent className="flex flex-col gap-1 pt-4">
                <CardTitle>{interview.title}</CardTitle>
                <CardDescription>
                  {interview.channel} · {interview.date}
                </CardDescription>
                <p className="text-sm text-slate-600 dark:text-slate-300">{interview.summary}</p>
              </CardContent>
            </Card>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-500">No se encontraron entrevistas.</p>}
      </div>
    </div>
  );
}
