import { getCardLeaders, getMOTMList, getTopScorers } from "@/lib/queries";
import { PlayerAvatar } from "@/components/player-avatar";
import { formatDateID } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function StatistikPage() {
  const [scorers, cards, motm] = await Promise.all([
    getTopScorers(20),
    getCardLeaders(20),
    getMOTMList(),
  ]);

  return (
    <div className="stack" style={{ gap: 32 }}>
      <header className="page-header">
        <h1 className="page-title">Statistik</h1>
        <p className="page-title-sub">
          Pencetak gol, penerima kartu, dan pemain terbaik turnamen.
        </p>
      </header>

      <section>
        <div className="section-row">
          <h2 className="section-title">Pencetak Gol Terbanyak</h2>
        </div>
        <div className="surface table-wrap">
          {scorers.length === 0 ? (
            <Empty text="Belum ada gol tercatat." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th className="l">Pemain</th>
                  <th>Gol</th>
                  <th className="l desktop-only">Menit</th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((s, i) => (
                  <tr key={s.player.id}>
                    <td className="num muted">{i + 1}</td>
                    <td className="l">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={s.player.name} url={s.player.photoUrl} size={28} />
                        <div>
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
                    <td className="l muted desktop-only" style={{ fontSize: 12 }}>
                      {s.minutes.map((m) => `${m}'`).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Penerima Kartu</h2>
        </div>
        <div className="surface table-wrap">
          {cards.length === 0 ? (
            <Empty text="Belum ada kartu dicatat." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>#</th>
                  <th className="l">Pemain</th>
                  <th>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="yellow-card" /> Kuning
                    </span>
                  </th>
                  <th>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="red-card" /> Merah
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cards.map((c, i) => (
                  <tr key={c.player.id}>
                    <td className="num muted">{i + 1}</td>
                    <td className="l">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={c.player.name} url={c.player.photoUrl} size={28} />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            <a href={`/pemain/${c.player.id}`}>{c.player.name}</a>
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            #{c.player.jerseyNumber} · {c.team.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="num">
                      {c.yellow > 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span className="yellow-card" /> {c.yellow}
                        </span>
                      ) : (
                        <span className="muted">0</span>
                      )}
                    </td>
                    <td
                      className="num"
                      style={{
                        color: c.red > 0 ? "var(--color-red-card)" : undefined,
                        fontWeight: c.red > 0 ? 800 : 400,
                      }}
                    >
                      {c.red > 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span className="red-card" /> {c.red}
                        </span>
                      ) : (
                        <span className="muted">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Man of the Match</h2>
        </div>
        <div className="surface">
          {motm.length === 0 ? (
            <Empty text="Belum ada MOTM tercatat." />
          ) : (
            <table className="data-table">
              <tbody>
                {motm.map((m) => (
                  <tr key={m.matchId}>
                    <td className="l muted" style={{ fontSize: 12, width: 160 }}>
                      {formatDateID(m.kickoffAt)}
                    </td>
                    <td className="l">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={m.player?.name ?? "—"} url={m.player?.photoUrl} size={28} />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {m.player ? <a href={`/pemain/${m.player.id}`}>{m.player.name}</a> : "—"}
                          </div>
                          <div className="muted" style={{ fontSize: 12 }}>
                            #{m.player?.jerseyNumber} · {m.team?.name}
                          </div>
                        </div>
                      </div>
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

function Empty({ text }: { text: string }) {
  return <div className="muted" style={{ padding: 22, textAlign: "center" }}>{text}</div>;
}
