import { IconSalad, IconBarbell, IconMoon, IconScale, IconBrain, type Icon } from '@tabler/icons-react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

export interface TopicItem {
  icon: 'alimentacion' | 'entrenamiento' | 'sueno' | 'metabolismo' | 'habitos';
  label: string;
  description: string;
  href: string;
}

const ICONS: Record<TopicItem['icon'], Icon> = {
  alimentacion: IconSalad,
  entrenamiento: IconBarbell,
  sueno: IconMoon,
  metabolismo: IconScale,
  habitos: IconBrain,
};

export default function TopicGrid({ items }: { items: TopicItem[] }) {
  return (
    <div className="not-content grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <a key={item.href} href={item.href} className="block h-full no-underline">
            <Card className="h-full transition-colors hover:border-ring">
              <CardContent className="flex h-full flex-col gap-3 pt-4">
                <div className="bg-muted text-foreground flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <CardTitle>{item.label}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardContent>
            </Card>
          </a>
        );
      })}
    </div>
  );
}
