import { getMatches } from "@/lib/queries";
import { MatchCard } from "@/components/match-card";
import { formatDateID, formatDateKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function HasilPage() {
  const finished = (await getMatches({ status: "FINISHED" })).reverse();

  const groups = new Map<string, typeof finished>();
  for (const m of finished) {
    const k = formatDateKey(m.kickoffAt);
    const arr = groups.get(k) ?? [];
    arr.push(m);
    groups.set(k, arr);
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="page-header">
        <h1 className="page-title">Hasil</h1>
        <p className="page-title-sub">Skor akhir dan ringkasan pertandingan.</p>
      </header>

      {groups.size === 0 ? (
        <div className="surface" style={{ padding: 28, textAlign: "center" }}>
          <span className="muted">Belum ada hasil pertandingan.</span>
        </div>
      ) : (
        Array.from(groups.entries()).map(([key, items]) => (
          <div key={key} className="week-strip">
            <div className="week-label">{formatDateID(items[0].kickoffAt)}</div>
            <div className="match-cards">
              {items.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
