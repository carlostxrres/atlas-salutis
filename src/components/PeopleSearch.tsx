import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { PersonGrid, type PersonSummary } from '@/components/PersonCard';

export type { PersonSummary };

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
    <div className="not-content flex flex-col gap-8">
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
