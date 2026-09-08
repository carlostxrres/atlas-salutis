import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from '@/lib/utils';

export interface PersonSummary {
  id: string;
  name: string;
  role: 'interviewee' | 'interviewer' | 'both';
  profession?: string;
  photo?: string;
  // Only rendered by the 'full' variant, so callers that just need the compact
  // card (e.g. the interview page) can skip the `getPostsForPerson()` lookup.
  bio?: string;
  postCount?: number;
}

// 'full' is the /people/ listing card: bio and post count included.
// 'compact' drops both so a page that already has its own subject — an
// interview, say — isn't dominated by its cast list.
export type PersonCardVariant = 'full' | 'compact';

export function PersonCard({
  person,
  variant = 'full',
}: {
  person: PersonSummary;
  variant?: PersonCardVariant;
}) {
  const isFull = variant === 'full';

  return (
    <a href={`/people/${person.id}/`} className="block h-full no-underline">
      <Card className="h-full transition-colors hover:border-ring">
        <CardContent className="flex h-full flex-col gap-3 pt-4">
          {/* I changed this to items-start because I prefer it this way */}
          <div className="flex items-start gap-3">
            <Avatar className={isFull ? 'size-12' : 'size-10'}>
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

          {isFull && person.bio && (
            // This has margin top:
            <p className="line-clamp-3 text-sm text-muted-foreground">{person.bio}</p>
          )}

          {isFull && person.postCount !== undefined && person.postCount > 0 && (
            // This has margin top:
            <p className="text-muted-foreground mt-auto text-xs">
              {person.postCount} {person.postCount === 1 ? 'post' : 'posts'}
            </p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

export function PersonGrid({
  people,
  variant = 'full',
}: {
  people: PersonSummary[];
  variant?: PersonCardVariant;
}) {
  return (
    <div
      className={
        variant === 'full'
          ? 'grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-4'
          : 'grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-start gap-3'
      }
    >
      {people.map((person) => (
        <PersonCard key={person.id} person={person} variant={variant} />
      ))}
    </div>
  );
}
