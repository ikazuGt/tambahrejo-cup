import { Skeleton, TableRowSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="stack" style={{ gap: 32 }}>
      <header className="page-header">
        <Skeleton width={140} height={32} />
      </header>
      {[0, 1, 2].map((i) => (
        <section key={i}>
          <div className="section-row">
            <Skeleton width={180} height={20} />
          </div>
          <div className="surface table-wrap">
            <table className="data-table">
              <tbody>
                {Array.from({ length: 5 }).map((_, j) => (
                  <TableRowSkeleton key={j} cols={3} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
