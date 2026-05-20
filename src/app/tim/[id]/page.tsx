import { notFound } from "next/navigation";
import { getTeamDetail } from "@/lib/queries";
import { TeamCrest } from "@/components/team-crest";
import { PlayerAvatar } from "@/components/player-avatar";
import { MatchCard } from "@/components/match-card";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = await getTeamDetail(Number(id));
  if (!team) notFound();

  return (
    <div className="stack" style={{ gap: 28 }}>
      <section
        className="surface"
        style={{ padding: 22, display: "flex", gap: 18, alignItems: "center" }}
      >
        <TeamCrest name={team.name} url={team.logoUrl} size={72} />
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title">{team.name}</h1>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            {team.origin}
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Manager:{" "}
            <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
              {team.managerName}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Skuad</h2>
        </div>
        <div className="surface table-wrap">
          <table className="data-table">
            <tbody>
              {[...team.players]
                .sort((a, b) => a.jerseyNumber - b.jerseyNumber)
                .map((p) => (
                  <tr key={p.id}>
                    <td
                      className="num l muted"
                      style={{ width: 60, fontWeight: 700 }}
                    >
                      #{p.jerseyNumber}
                    </td>
                    <td className="l" style={{ fontWeight: 600 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <PlayerAvatar name={p.name} url={p.photoUrl} size={36} />
                        <a href={`/pemain/${p.id}`}>{p.name}</a>
                      </span>
                    </td>
                    <td className="muted" style={{ width: 64, fontSize: 12 }}>
                      {p.position}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="section-row">
          <h2 className="section-title">Pertandingan</h2>
        </div>
        {team.matches.length === 0 ? (
          <div
            className="surface"
            style={{ padding: 22, textAlign: "center" }}
          >
            <span className="muted">Belum ada pertandingan.</span>
          </div>
        ) : (
          <div className="match-cards">
            {team.matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
