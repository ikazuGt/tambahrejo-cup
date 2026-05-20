import { MatchCardsGrid, Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="page-header">
        <Skeleton width={120} height={32} />
      </header>
      <MatchCardsGrid count={6} />
    </div>
  );
}
