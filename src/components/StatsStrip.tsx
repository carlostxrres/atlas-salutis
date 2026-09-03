export interface StatItem {
  value: number;
  label: string;
  href?: string;
}

export default function StatsStrip({ items }: { items: StatItem[] }) {
  return (
    <div className="not-content grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
      {items.map((item) => {
        const tile = (
          <div className="border-border bg-card group-hover:border-ring rounded-lg border px-5 py-4 transition-colors">
            <p className="text-foreground text-3xl font-semibold tabular-nums">{item.value}</p>
            <p className="text-muted-foreground text-sm">{item.label}</p>
          </div>
        );
        return item.href ? (
          <a key={item.label} href={item.href} className="group block no-underline">
            {tile}
          </a>
        ) : (
          <div key={item.label}>{tile}</div>
        );
      })}
    </div>
  );
}
