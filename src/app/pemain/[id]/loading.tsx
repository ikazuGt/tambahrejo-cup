import { Skeleton, TableRowSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 28 }}>
      <section className="surface" style={{ padding: 24, display: "flex", gap: 20, alignItems: "center" }}>
        <Skeleton width={96} height={96} radius={999} />
        <div style={{ flex: 1 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={220} height={28} style={{ marginTop: 8 }} />
          <Skeleton width={180} height={16} style={{ marginTop: 10 }} />
        </div>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface" style={{ padding: 18 }}>
            <Skeleton width={80} height={11} />
            <Skeleton width={50} height={36} style={{ marginTop: 6 }} />
          </div>
        ))}
      </section>
      <section>
        <div className="section-row">
          <Skeleton width={140} height={20} />
        </div>
        <div className="surface table-wrap">
          <table className="data-table">
            <tbody>
              {Array.from({ length: 4 }).map((_, j) => (
                <TableRowSkeleton key={j} cols={4} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
