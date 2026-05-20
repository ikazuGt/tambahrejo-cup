import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="page-header">
        <Skeleton width={160} height={32} />
      </header>
      <div className="team-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="team-card" style={{ pointerEvents: "none" }}>
            <Skeleton width={52} height={52} radius={999} />
            <div className="team-card-info" style={{ flex: 1 }}>
              <Skeleton width="70%" height={16} />
              <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
