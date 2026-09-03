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
    <div className="not-content flex flex-col gap-4">
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
            <Card className="transition-colors hover:border-ring">
              <CardContent className="flex flex-col gap-1 pt-4">
                <CardTitle>{interview.title}</CardTitle>
                <CardDescription>
                  {interview.channel} · {interview.date}
                </CardDescription>
                <p className="text-muted-foreground text-sm">{interview.summary}</p>
              </CardContent>
            </Card>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-sm">No se encontraron entrevistas.</p>}
      </div>
    </div>
  );
}
