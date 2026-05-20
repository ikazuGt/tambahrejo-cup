import Link from "next/link";
import { TeamCrest } from "./team-crest";

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function shortDate(d: Date) {
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`;
}
function shortTime(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type Props = {
  match: {
    id: number;
    kickoffAt: Date;
    status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
    homeScore: number | null;
    awayScore: number | null;
    home: { name: string; logoUrl: string | null } | null;
    away: { name: string; logoUrl: string | null } | null;
  };
};

export function MatchCard({ match }: Props) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const showScore = isFinished || isLive;

  return (
    <Link href={`/pertandingan/${match.id}`} className="match-card">
      <div className="mc-teams">
        <div className="mc-team">
          <TeamCrest name={match.home?.name ?? "TBD"} url={match.home?.logoUrl ?? null} size={56} />
          <span className="mc-team-name">{match.home?.name ?? "TBD"}</span>
        </div>
        {showScore ? (
          <div className="mc-score num">
            {match.homeScore ?? 0}
            <span className="sep">-</span>
            {match.awayScore ?? 0}
          </div>
        ) : (
          <div className="mc-vs">VS</div>
        )}
        <div className="mc-team">
          <TeamCrest name={match.away?.name ?? "TBD"} url={match.away?.logoUrl ?? null} size={56} />
          <span className="mc-team-name">{match.away?.name ?? "TBD"}</span>
        </div>
      </div>

      <div className="mc-time num">
        {shortDate(match.kickoffAt)} · {shortTime(match.kickoffAt)}
      </div>

      {isLive ? (
        <span className="mc-pill live-pill">
          <span className="live-dot" /> Live
        </span>
      ) : isFinished ? (
        <span className="mc-pill muted-pill">Full Time</span>
      ) : (
        <span className="mc-pill">Detail</span>
      )}
    </Link>
  );
}
