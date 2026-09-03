import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';

export interface PersonSummary {
  id: string;
  name: string;
  role: 'interviewee' | 'interviewer' | 'both';
  profession?: string;
  bio: string;
  photo?: string;
  postCount: number;
}

function PersonCard({ person }: { person: PersonSummary }) {
  return (
    <a href={`/people/${person.id}/`} className="block h-full no-underline">
      <Card className="h-full transition-colors hover:border-ring">
        <CardContent className="flex h-full flex-col gap-3 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              {person.photo ? (
                <AvatarImage src={person.photo} alt={person.name} />
              ) : (
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <CardTitle>{person.name}</CardTitle>
              {person.profession && <CardDescription>{person.profession}</CardDescription>}
            </div>
          </div>

          <p className="line-clamp-3 text-sm text-muted-foreground">{person.bio}</p>

          {person.postCount > 0 && (
            <p className="text-muted-foreground mt-auto text-xs">
              {person.postCount} {person.postCount === 1 ? 'post' : 'posts'}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

function PersonGrid({ people }: { people: PersonSummary[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-4">
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}

export default function PeopleSearch({ people }: { people: PersonSummary[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (person) => person.name.toLowerCase().includes(q) || person.profession?.toLowerCase().includes(q),
    );
  }, [people, query]);

  const interviewees = useMemo(
    () => filtered.filter((person) => person.role === 'interviewee' || person.role === 'both'),
    [filtered],
  );
  const interviewers = useMemo(
    () => filtered.filter((person) => person.role === 'interviewer' || person.role === 'both'),
    [filtered],
  );

  return (
    <div className="flex flex-col gap-8">
      <Input
        type="search"
        placeholder="Buscar por nombre o profesión..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Buscar personas"
      />

      {filtered.length === 0 && <p className="text-muted-foreground text-sm">No se encontraron personas.</p>}

      {interviewees.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-2xl font-semibold">Entrevistados</h2>
          <PersonGrid people={interviewees} />
        </section>
      )}

      {interviewers.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-foreground text-2xl font-semibold">Entrevistadores</h2>
          <PersonGrid people={interviewers} />
        </section>
      )}
    </div>
  );
}
