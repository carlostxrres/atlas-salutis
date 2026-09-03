import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardFooter } from '@/components/ui/card';
import { initials } from '@/lib/utils';

export interface AuthorSummary {
  id: string;
  name: string;
  profession?: string;
  photo?: string;
}

export default function AuthorHeaderList({ people }: { people: AuthorSummary[] }) {
  if (people.length === 0) return null;

  return (
    <div className="not-content mb-6 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-6">
      {people.map((person) => (
        <a href={`/people/${person.id}/`} key={person.id}>
          <CardFooter className="w-auto items-start gap-3 p-0">
            <Avatar className="size-10">
              {person.photo ? (
                <AvatarImage src={person.photo} alt={person.name} />
              ) : (
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex flex-1 flex-col items-start gap-0">
              <span className="text-foreground text-sm font-medium no-underline hover:underline">{person.name}</span>

              {person.profession && <p className="text-muted-foreground text-sm">{person.profession}</p>}
            </div>
          </CardFooter>
        </a>
      ))}
    </div>
  );
}
