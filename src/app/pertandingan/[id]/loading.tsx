import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 24 }}>
      <Skeleton width={80} height={14} />
      <section className="surface scoreboard-wrap" style={{ padding: 0 }}>
        <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
          <Skeleton width="100%" height={14} />
        </div>
        <div className="scoreboard">
          <div className="team-block">
            <Skeleton width={84} height={84} radius={999} />
            <Skeleton width={120} height={18} />
            <Skeleton width={90} height={12} />
          </div>
          <Skeleton width={120} height={50} />
          <div className="team-block">
            <Skeleton width={84} height={84} radius={999} />
            <Skeleton width={120} height={18} />
            <Skeleton width={90} height={12} />
          </div>
        </div>
      </section>
      <section>
        <div className="section-row">
          <Skeleton width={180} height={20} />
        </div>
        <div className="surface" style={{ padding: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
              <Skeleton width={40} height={14} />
              <Skeleton width={20} height={20} />
              <Skeleton width="60%" height={14} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
