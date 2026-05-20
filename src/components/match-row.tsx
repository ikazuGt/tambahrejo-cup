import Link from "next/link";
import { formatTimeID, STATUS_LABEL } from "@/lib/utils";
import { TeamCrest } from "./team-crest";

type Props = {
  match: {
    id: number;
    kickoffAt: Date;
    status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
    homeScore: number | null;
    awayScore: number | null;
    home: { id: number; name: string; logoUrl: string | null };
    away: { id: number; name: string; logoUrl: string | null };
    groupName: string | null;
  };
};

export function MatchRow({ match }: Props) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const showScore = isFinished || isLive;

  return (
    <Link href={`/pertandingan/${match.id}`} className="match-row" aria-label={`${match.home.name} vs ${match.away.name}`}>
      <span className="match-time num">{formatTimeID(match.kickoffAt)}</span>

      <div className="match-sides">
        <div className="match-side">
          <TeamCrest name={match.home.name} url={match.home.logoUrl} size={20} />
          <span className="match-side-name">{match.home.name}</span>
          {showScore && <span className="match-side-score num">{match.homeScore ?? 0}</span>}
        </div>
        <div className="match-side">
          <TeamCrest name={match.away.name} url={match.away.logoUrl} size={20} />
          <span className="match-side-name">{match.away.name}</span>
          {showScore && <span className="match-side-score num">{match.awayScore ?? 0}</span>}
        </div>
      </div>

      <div className="match-status">
        {isLive ? (
          <span className="badge badge-live">
            <span className="live-dot" /> LIVE
          </span>
        ) : isFinished ? (
          <span className="badge badge-ft">FT</span>
        ) : (
          <span className="badge">{STATUS_LABEL[match.status]}</span>
        )}
      </div>
    </Link>
  );
}
