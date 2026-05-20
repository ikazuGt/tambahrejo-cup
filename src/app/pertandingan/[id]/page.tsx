import { notFound } from "next/navigation";
import Link from "next/link";
import { getMatchDetail } from "@/lib/queries";
import { TeamCrest } from "@/components/team-crest";
import { PlayerAvatar } from "@/components/player-avatar";
import { formatDateID, formatTimeID, ROUND_LABEL, STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getMatchDetail(Number(id));
  if (!m || !m.home || !m.away) notFound();

  const events = [
    ...m.goals.map((g) => ({ kind: "goal" as const, ...g })),
    ...m.cards.map((c) => ({ kind: "card" as const, ...c })),
  ].sort((a, b) => a.minute - b.minute);

  const isLive = m.status === "LIVE";
  const isFinished = m.status === "FINISHED";
  const showScore = isFinished || isLive;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <Link href="/jadwal" className="muted" style={{ fontSize: 13 }}>
        ← Kembali
      </Link>

      <section className="surface scoreboard-wrap">
        <div className="scoreboard-meta">
          <span>
            {ROUND_LABEL[m.round]}
            {m.groupName ? ` · ${m.groupName}` : ""}
          </span>
          <span className="num">
            {formatDateID(m.kickoffAt)} · {formatTimeID(m.kickoffAt)}
          </span>
        </div>

        <div className="scoreboard">
          <Link href={`/tim/${m.home.id}`} className="team-block">
            <TeamCrest name={m.home.name} url={m.home.logoUrl} size={84} />
            <div className="team-block-name">{m.home.name}</div>
            <div className="team-block-origin">{m.home.origin}</div>
          </Link>

          <div>
            <div className="score-big num">
              {showScore ? (
                <>
                  {m.homeScore ?? 0}
                  <span className="sep">-</span>
                  {m.awayScore ?? 0}
                </>
              ) : (
                <span className="muted" style={{ fontSize: 28, fontWeight: 700 }}>vs</span>
              )}
            </div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              {isLive ? (
                <span className="badge badge-live">
                  <span className="live-dot" /> LIVE
                </span>
              ) : isFinished ? (
                <span className="badge badge-ft">Full Time</span>
              ) : (
                <span className="badge">{STATUS_LABEL[m.status]}</span>
              )}
            </div>
          </div>

          <Link href={`/tim/${m.away.id}`} className="team-block">
            <TeamCrest name={m.away.name} url={m.away.logoUrl} size={84} />
            <div className="team-block-name">{m.away.name}</div>
            <div className="team-block-origin">{m.away.origin}</div>
          </Link>
        </div>

        <div className="scoreboard-venue">📍 {m.venue}</div>

        {/* Goal & card summary inline */}
        {(m.goals.length > 0 || m.cards.length > 0) && (
          <div className="match-events-summary">
            {m.goals.length > 0 && (
              <div className="events-col">
                <div className="events-col-title">⚽ Pencetak Gol</div>
                {m.goals.map((g) => (
                  <div key={g.id} className="event-line">
                    <a href={`/pemain/${g.player.id}`} className="event-player">
                      {g.player.name}
                    </a>
                    <span className="event-detail num">{g.minute}&apos;</span>
                    <span className="event-team">{g.team.name}</span>
                    {g.type !== "GOAL" && (
                      <span className="event-type">
                        {g.type === "PENALTY" ? "(P)" : "(OG)"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {m.cards.length > 0 && (
              <div className="events-col">
                <div className="events-col-title">Kartu</div>
                {m.cards.map((c) => (
                  <div key={c.id} className="event-line">
                    <span className={c.type === "YELLOW" ? "yellow-card" : "red-card"} style={{ flexShrink: 0 }} />
                    <a href={`/pemain/${c.player.id}`} className="event-player">
                      {c.player.name}
                    </a>
                    <span className="event-detail num">{c.minute}&apos;</span>
                    <span className="event-team">{c.team.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {m.motm && (
        <section className="surface motm-row">
          <div className="motm-tag">MOTM</div>
          <div style={{ minWidth: 0 }}>
            <div className="label" style={{ marginBottom: 2 }}>
              Man of the Match
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <PlayerAvatar name={m.motm.name} url={m.motm.photoUrl} size={40} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>
                  <a href={`/pemain/${m.motm.id}`}>{m.motm.name}</a>{" "}
                  <span className="num muted" style={{ fontWeight: 500 }}>
                    #{m.motm.jerseyNumber}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 13 }}>{m.motm.team?.name}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section>
          <div className="section-row">
            <h2 className="section-title">Jalannya Pertandingan</h2>
          </div>
          <div className="surface timeline">
            {events.map((e, i) => (
              <div key={i} className="timeline-row">
                <span className="num timeline-minute">{e.minute}&apos;</span>
                <span style={{ fontSize: 18 }}>
                  {e.kind === "goal" ? (
                    "⚽"
                  ) : e.type === "YELLOW" ? (
                    <span className="yellow-card" aria-label="Kartu kuning" />
                  ) : (
                    <span className="red-card" aria-label="Kartu merah" />
                  )}
                </span>
                <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <PlayerAvatar name={e.player.name} url={e.player.photoUrl} size={24} />
                  <span>
                    <a href={`/pemain/${e.player.id}`} style={{ fontWeight: 600 }}>
                      {e.player.name}
                    </a>
                    <span className="num muted" style={{ marginLeft: 6 }}>
                      #{e.player.jerseyNumber}
                    </span>
                    <span className="muted" style={{ fontSize: 12.5, marginLeft: 8 }}>
                      {e.team.name}
                      {e.kind === "goal" && e.type !== "GOAL"
                        ? ` · ${e.type === "PENALTY" ? "Penalti" : "Bunuh Diri"}`
                        : ""}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ref-grid">
        <div className="surface ref-card">
          <div className="ref-card-label">Wasit Tengah</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlayerAvatar name={m.centerReferee?.name ?? "—"} url={m.centerReferee?.photoUrl} size={32} />
            <div className="ref-card-name">{m.centerReferee?.name ?? "—"}</div>
          </div>
        </div>
        <div className="surface ref-card">
          <div className="ref-card-label">Hakim Garis 1</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlayerAvatar name={m.linesman1?.name ?? "—"} url={m.linesman1?.photoUrl} size={32} />
            <div className="ref-card-name">{m.linesman1?.name ?? "—"}</div>
          </div>
        </div>
        <div className="surface ref-card">
          <div className="ref-card-label">Hakim Garis 2</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PlayerAvatar name={m.linesman2?.name ?? "—"} url={m.linesman2?.photoUrl} size={32} />
            <div className="ref-card-name">{m.linesman2?.name ?? "—"}</div>
          </div>
        </div>
      </section>

      {m.photos.length > 0 && (
        <section>
          <div className="section-row">
            <h2 className="section-title">Foto</h2>
          </div>
          <div className="photo-grid">
            {m.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt={p.caption ?? ""} loading="lazy" />
            ))}
          </div>
        </section>
      )}

      {m.highlightVideoUrl && (
        <section>
          <div className="section-row">
            <h2 className="section-title">Cuplikan</h2>
          </div>
          <div className="surface" style={{ aspectRatio: "16 / 9", overflow: "hidden" }}>
            <VideoEmbed url={m.highlightVideoUrl} />
          </div>
        </section>
      )}
    </div>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const youtube = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/
  );
  if (youtube) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtube[1]}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
        title="Cuplikan pertandingan"
      />
    );
  }
  return (
    <video controls preload="none" style={{ width: "100%", height: "100%", background: "black" }}>
      <source src={url} />
    </video>
  );
}
