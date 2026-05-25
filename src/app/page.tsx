import Image from "next/image";
import { getRecentResults, getTopScorers, getUpcomingMatches } from "@/lib/queries";
import { MatchCard } from "@/components/match-card";
import { LiveMatches } from "@/components/live-matches";
import { PlayerAvatar } from "@/components/player-avatar";
import { formatDateID, formatTimeID, ROUND_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function HomePage() {
  const [upcoming, recent, scorers] = await Promise.all([
    getUpcomingMatches(8),
    getRecentResults(8),
    getTopScorers(5),
  ]);
  const next = upcoming[0];

  const upcomingByRound = new Map<string, typeof upcoming>();
  for (const m of upcoming) {
    const arr = upcomingByRound.get(m.round) ?? [];
    arr.push(m);
    upcomingByRound.set(m.round, arr);
  }

  return (
    <div className="stack" style={{ gap: 32 }}>
      <LiveMatches />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Musim 2026 · Open Tournament</div>
          <h1 className="hero-title">
            Tambahrejo Cup
            <span className="by">Persembahan Zay.Agency</span>
          </h1>
          <p className="hero-desc">
            Open turnamen sepak bola se-Tambahrejo. Pantau jadwal pertandingan,
            klasemen tim, top skor, dan pemain terbaik tiap laga secara langsung
            dari satu tempat.
          </p>
          <div className="hero-actions">
            <a href="/jadwal" className="btn btn-primary">
              Lihat Jadwal
            </a>
            <a href="/bracket" className="btn">
              Bagan Turnamen
            </a>
            <a href="/admin" className="btn">
              Panel Admin
            </a>
          </div>
          {next && (
            <div className="next-match">
              <span className="badge badge-brand">Berikutnya</span>
              <span className="num muted" style={{ fontSize: 12 }}>
                {formatDateID(next.kickoffAt)} · {formatTimeID(next.kickoffAt)}
              </span>
              <span style={{ fontWeight: 600 }}>
                {next.home?.name ?? "TBD"} <span className="muted">vs</span> {next.away?.name ?? "TBD"}
              </span>
              <a
                href={`/pertandingan/${next.id}`}
                className="btn btn-primary btn-sm"
                style={{ marginLeft: "auto" }}
              >
                Detail
              </a>
            </div>
          )}
        </div>
        <div className="hero-logo">
          <Image
            src="/logo.png"
            alt="Tambahrejo Cup 2026"
            width={280}
            height={280}
            priority
          />
        </div>
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Jadwal Mendatang</h2>
          <a href="/jadwal" className="section-link">Lihat semua →</a>
        </div>
        {upcoming.length === 0 ? (
          <Empty text="Belum ada jadwal." />
        ) : (
          <div className="stack" style={{ gap: 22 }}>
            {Array.from(upcomingByRound.entries()).map(([round, items]) => (
              <div key={round} className="week-strip">
                <div className="week-label">{ROUND_LABEL[round]}</div>
                <div className="match-cards">
                  {items.map((m) => (
                    <MatchCard key={m.id} match={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Hasil Terbaru</h2>
          <a href="/hasil" className="section-link">Lihat semua →</a>
        </div>
        {recent.length === 0 ? (
          <Empty text="Belum ada hasil pertandingan." />
        ) : (
          <div className="match-cards">
            {recent.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Top Skor</h2>
          <a href="/statistik" className="section-link">Lihat semua →</a>
        </div>
        <div className="surface table-wrap">
          {scorers.length === 0 ? (
            <Empty text="Belum ada gol tercatat." inline />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th className="l">Pemain</th>
                  <th>Gol</th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((s, i) => (
                  <tr key={s.player.id}>
                    <td className="num muted">{i + 1}</td>
                    <td className="l">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={s.player.name} url={s.player.photoUrl} size={32} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>
                            <a href={`/pemain/${s.player.id}`}>{s.player.name}</a>
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            #{s.player.jerseyNumber} · {s.team.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="num" style={{ fontWeight: 800, fontSize: 16 }}>
                      {s.goals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function Empty({ text, inline }: { text: string; inline?: boolean }) {
  return (
    <div
      className={inline ? "muted" : "surface muted"}
      style={{ padding: "24px 16px", fontSize: 13.5, textAlign: "center" }}
    >
      {text}
    </div>
  );
}
