import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import InterviewMeta, { type InterviewMetaData } from '@/components/InterviewMeta';

export interface LinkCardItem {
  href: string;
  title: string;
  description?: string;
  // When the linked entry is an interview, its metadata renders as the same
  // pill used on /interviews/ and on the interview page itself, rather than as
  // another hand-joined description string.
  meta?: InterviewMetaData;
}

export default function LinkCardList({ items, emptyLabel }: { items: LinkCardItem[]; emptyLabel: string }) {
  if (items.length === 0) return <p className="text-muted-foreground text-sm">{emptyLabel}</p>;

  return (
    <div className="not-content grid gap-3">
      {items.map((item) => (
        <a key={item.href} href={item.href} className="block no-underline">
          <Card className="transition-colors hover:border-ring">
            <CardContent className="flex flex-col gap-1 pt-4">
              <CardTitle>{item.title}</CardTitle>
              {item.meta ? (
                <InterviewMeta size="sm" className="mt-0.5" {...item.meta} />
              ) : (
                item.description && <CardDescription>{item.description}</CardDescription>
              )}
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
