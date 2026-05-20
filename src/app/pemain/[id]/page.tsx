import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/queries";
import { PlayerAvatar } from "@/components/player-avatar";
import { TeamCrest } from "@/components/team-crest";
import { formatDateID, ROUND_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerProfile(Number(id));
  if (!player) notFound();

  const totalGoals = player.goals.length;
  const yellowCards = player.cards.filter((c) => c.type === "YELLOW").length;
  const redCards = player.cards.filter((c) => c.type === "RED").length;
  const motmCount = player.motmCount;

  const positionLabel: Record<string, string> = {
    GK: "Kiper",
    DEF: "Bek",
    MID: "Gelandang",
    FWD: "Penyerang",
  };

  return (
    <div className="stack" style={{ gap: 28 }}>
      {/* Hero: photo + name + team */}
      <section
        className="surface"
        style={{
          padding: 24,
          display: "flex",
          gap: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <PlayerAvatar name={player.name} url={player.photoUrl} size={96} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="muted" style={{ fontSize: 12, fontWeight: 600 }}>
            #{player.jerseyNumber} · {positionLabel[player.position] ?? player.position}
          </div>
          <h1 className="page-title" style={{ marginTop: 4 }}>
            {player.name}
          </h1>
          {player.team && (
            <a
              href={`/tim/${player.team.id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10 }}
            >
              <TeamCrest name={player.team.name} url={player.team.logoUrl} size={28} />
              <span style={{ fontWeight: 600 }}>{player.team.name}</span>
              <span className="muted" style={{ fontSize: 12 }}>· {player.team.origin}</span>
            </a>
          )}
        </div>
      </section>

      {/* Stat cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="Gol" value={totalGoals} accent />
        <StatCard label="Kartu Kuning" value={yellowCards} />
        <StatCard label="Kartu Merah" value={redCards} danger={redCards > 0} />
        <StatCard label="Man of the Match" value={motmCount} accent={motmCount > 0} />
      </section>

      {/* Goal log */}
      <section>
        <div className="section-row">
          <h2 className="section-title">Riwayat Gol</h2>
        </div>
        <div className="surface table-wrap">
          {player.goals.length === 0 ? (
            <div className="muted" style={{ padding: 22, textAlign: "center" }}>
              Belum ada gol tercatat.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="l">Tanggal</th>
                  <th className="l">Babak</th>
                  <th>Menit</th>
                  <th>Tipe</th>
                </tr>
              </thead>
              <tbody>
                {player.goals.map((g) => (
                  <tr key={g.id}>
                    <td className="l muted" style={{ fontSize: 12 }}>
                      {g.match ? (
                        <a href={`/pertandingan/${g.match.id}`}>
                          {formatDateID(g.match.kickoffAt)}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="l" style={{ fontSize: 12 }}>
                      {g.match ? ROUND_LABEL[g.match.round] : "—"}
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>{g.minute}&apos;</td>
                    <td className="muted" style={{ fontSize: 12 }}>
                      {g.type === "GOAL" ? "Gol" : g.type === "PENALTY" ? "Penalti" : "Bunuh Diri"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Card log */}
      <section>
        <div className="section-row">
          <h2 className="section-title">Riwayat Kartu</h2>
        </div>
        <div className="surface table-wrap">
          {player.cards.length === 0 ? (
            <div className="muted" style={{ padding: 22, textAlign: "center" }}>
              Belum ada kartu tercatat.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="l">Tanggal</th>
                  <th className="l">Babak</th>
                  <th>Menit</th>
                  <th>Warna</th>
                </tr>
              </thead>
              <tbody>
                {player.cards.map((c) => (
                  <tr key={c.id}>
                    <td className="l muted" style={{ fontSize: 12 }}>
                      {c.match ? (
                        <a href={`/pertandingan/${c.match.id}`}>
                          {formatDateID(c.match.kickoffAt)}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="l" style={{ fontSize: 12 }}>
                      {c.match ? ROUND_LABEL[c.match.round] : "—"}
                    </td>
                    <td className="num" style={{ fontWeight: 700 }}>{c.minute}&apos;</td>
                    <td>
                      <span
                        className={c.type === "YELLOW" ? "yellow-card" : "red-card"}
                        style={{ display: "inline-block" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* MOTM log */}
      {motmCount > 0 && (
        <section>
          <div className="section-row">
            <h2 className="section-title">Man of the Match</h2>
          </div>
          <div className="surface table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="l">Tanggal</th>
                  <th className="l">Babak</th>
                </tr>
              </thead>
              <tbody>
                {player.motmMatches.map((m) => (
                  <tr key={m.id}>
                    <td className="l">
                      <a href={`/pertandingan/${m.id}`}>{formatDateID(m.kickoffAt)}</a>
                    </td>
                    <td className="l" style={{ fontSize: 12 }}>
                      {ROUND_LABEL[m.round]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="surface" style={{ padding: 18 }}>
      <div className="muted" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div
        className="num"
        style={{
          fontSize: 36,
          fontWeight: 900,
          marginTop: 4,
          color: danger ? "var(--color-red-card)" : accent ? "var(--color-brand)" : "var(--foreground)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
