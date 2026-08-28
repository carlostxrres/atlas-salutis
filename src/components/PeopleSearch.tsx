import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface PersonSummary {
  id: string;
  name: string;
  role: 'interviewee' | 'interviewer' | 'both';
  profession?: string;
}

export default function PeopleSearch({ people }: { people: PersonSummary[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(q) || person.profession?.toLowerCase().includes(q),
    );
  }, [people, query]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder="Buscar por nombre o profesión..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Buscar personas"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((person) => (
          <a key={person.id} href={`/people/${person.id}/`}>
            <Card className="h-full transition-colors hover:border-slate-400 dark:hover:border-slate-500">
              <CardContent className="flex flex-col gap-2 pt-4">
                <CardTitle>{person.name}</CardTitle>
                {person.profession && <CardDescription>{person.profession}</CardDescription>}
                <Badge variant="secondary" className="w-fit">
                  {person.role === 'interviewee' && 'Entrevistado/a'}
                  {person.role === 'interviewer' && 'Entrevistador/a'}
                  {person.role === 'both' && 'Entrevistado/a y entrevistador/a'}
                </Badge>
              </CardContent>
            </Card>
          </a>
        ))}
        {filtered.length === 0 && <p className="text-sm text-slate-500">No se encontraron personas.</p>}
      </div>
    </div>
  );
}
