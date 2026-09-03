import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export interface LinkCardItem {
  href: string;
  title: string;
  description?: string;
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
              {item.description && <CardDescription>{item.description}</CardDescription>}
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
