import { MatchCardsGrid, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="page-header">
        <Skeleton width={140} height={32} />
      </header>
      <div className="chips">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width={90} height={30} radius={999} />
        ))}
      </div>
      <div className="week-strip">
        <Skeleton width={120} height={20} style={{ marginBottom: 14 }} />
        <MatchCardsGrid count={8} />
      </div>
    </div>
  );
}
