import Link from "next/link";
import { getMatches } from "@/lib/queries";
import { MatchCard } from "@/components/match-card";
import { ROUND_LABEL, ROUND_ORDER } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

const ALLOWED_ROUNDS = ROUND_ORDER as readonly string[];

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.round && ALLOWED_ROUNDS.includes(sp.round) ? sp.round : null;

  const all = await getMatches();
  const now = new Date();
  const upcoming = all.filter(
    (m) =>
      m.status !== "FINISHED" &&
      m.kickoffAt >= new Date(now.getTime() - 1000 * 60 * 60 * 4)
  );
  const filtered = filter ? upcoming.filter((m) => m.round === filter) : upcoming;

  const groups = new Map<string, typeof filtered>();
  for (const m of filtered) {
    const arr = groups.get(m.round) ?? [];
    arr.push(m);
    groups.set(m.round, arr);
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <header className="page-header">
        <h1 className="page-title">Jadwal</h1>
        <p className="page-title-sub">Semua pertandingan yang akan datang.</p>
      </header>

      <div className="chips">
        <Link href="/jadwal" className="chip" data-active={!filter}>
          Semua
        </Link>
        {ROUND_ORDER.map((r) => (
          <Link
            key={r}
            href={`/jadwal?round=${r}`}
            className="chip"
            data-active={filter === r}
          >
            {ROUND_LABEL[r]}
          </Link>
        ))}
      </div>

      {groups.size === 0 ? (
        <div className="surface" style={{ padding: 28, textAlign: "center" }}>
          <span className="muted">Tidak ada jadwal.</span>
        </div>
      ) : (
        Array.from(groups.entries())
          .sort(([a], [b]) => ROUND_ORDER.indexOf(a as never) - ROUND_ORDER.indexOf(b as never))
          .map(([round, items]) => (
            <div key={round} className="week-strip">
              <div className="week-label">{ROUND_LABEL[round]}</div>
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
