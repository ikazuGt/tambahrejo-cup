import { Skeleton, TableRowSkeleton, MatchCardsGrid } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="surface" style={{ padding: 22, display: "flex", gap: 18, alignItems: "center" }}>
        <Skeleton width={72} height={72} radius={999} />
        <div style={{ flex: 1 }}>
          <Skeleton width={220} height={28} />
          <Skeleton width={160} height={14} style={{ marginTop: 8 }} />
        </div>
      </section>
      <section>
        <div className="section-row">
          <Skeleton width={100} height={20} />
        </div>
        <div className="surface table-wrap">
          <table className="data-table">
            <tbody>
              {Array.from({ length: 11 }).map((_, j) => (
                <TableRowSkeleton key={j} cols={3} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <div className="section-row">
          <Skeleton width={140} height={20} />
        </div>
        <MatchCardsGrid count={4} />
      </section>
    </div>
  );
}
