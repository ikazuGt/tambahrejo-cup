"use client";

import { useEffect, useState } from "react";
import { TeamCrest } from "./team-crest";

type LiveMatch = {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  livestreamUrl: string | null;
  round: string;
};

function getEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1`;
  if (url.includes("facebook.com")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true&mute=true`;
  }
  if (url.includes("embed") || url.includes("iframe")) return url;
  return null;
}

export function LiveMatches() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchLive() {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setMatches(data);
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  if (loading || matches.length === 0) return null;

  return (
    <section className="live-section">
      {matches.map((m) => {
        const embedUrl = m.livestreamUrl ? getEmbedUrl(m.livestreamUrl) : null;
        return (
          <div key={m.id} className="live-broadcast">
            {/* Top meta row: LIVE pill + round */}
            <div className="live-broadcast-meta">
              <div className="live-broadcast-pill">
                <span className="live-dot" />
                LIVE
              </div>
              <div className="live-broadcast-round">{m.round}</div>
            </div>

            {/* Score strip on top */}
            <div className="live-broadcast-score">
              <a href={`/tim/${m.id}`} className="lbs-team home">
                <TeamCrest name={m.homeTeamName} url={m.homeTeamLogo} size={42} />
                <span className="lbs-name">{m.homeTeamName}</span>
              </a>
              <div className="lbs-numbers num">
                <span>{m.homeScore ?? 0}</span>
                <span className="lbs-sep">-</span>
                <span>{m.awayScore ?? 0}</span>
              </div>
              <a href={`/tim/${m.id}`} className="lbs-team away">
                <span className="lbs-name">{m.awayTeamName}</span>
                <TeamCrest name={m.awayTeamName} url={m.awayTeamLogo} size={42} />
              </a>
            </div>

            {/* Video below the score */}
            {embedUrl ? (
              <div className="live-broadcast-video">
                <iframe
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Live: ${m.homeTeamName} vs ${m.awayTeamName}`}
                />
              </div>
            ) : (
              <div className="live-broadcast-video live-broadcast-placeholder">
                <span className="muted">Live stream belum tersedia</span>
              </div>
            )}

            <a href={`/pertandingan/${m.id}`} className="live-broadcast-detail">
              Lihat detail pertandingan →
            </a>
          </div>
        );
      })}
    </section>
  );
}
