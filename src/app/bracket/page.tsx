import Link from "next/link";
import { getMatches } from "@/lib/queries";
import { TeamCrest } from "@/components/team-crest";
import { ROUND_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 60;

// ---- layout constants (px) ----
const MATCH_W = 178;
const MATCH_H = 76;
const COL_GAP = 36;
const COL_W = MATCH_W + COL_GAP; // 214
const ROW_GAP = 14; // gap between R16 matches

// y-positions (top of card) — derived to make pairs align at next column's center
const R16_TOPS = [0, MATCH_H + ROW_GAP, 2 * (MATCH_H + ROW_GAP), 3 * (MATCH_H + ROW_GAP)];
const QF_TOPS = [
  (R16_TOPS[0] + R16_TOPS[1]) / 2,
  (R16_TOPS[2] + R16_TOPS[3]) / 2,
];
const SF_TOP = (QF_TOPS[0] + QF_TOPS[1]) / 2;
const FINAL_TOP = SF_TOP;

const TOTAL_W = 7 * MATCH_W + 6 * COL_GAP; // 1308
const TOTAL_H = R16_TOPS[3] + MATCH_H; // 250

const COL_X: Record<string, number> = {
  r16L: 0,
  qfL: COL_W,
  sfL: 2 * COL_W,
  final: 3 * COL_W,
  sfR: 4 * COL_W,
  qfR: 5 * COL_W,
  r16R: 6 * COL_W,
};

type Match = Awaited<ReturnType<typeof getMatches>>[number];

export default async function BracketPage() {
  const all = await getMatches();
  const byRound = new Map<string, Match[]>();
  for (const m of all) {
    const arr = byRound.get(m.round) ?? [];
    arr.push(m);
    byRound.set(m.round, arr);
  }

  const r16 = byRound.get("R16") ?? [];
  const qf = byRound.get("QF") ?? [];
  const sf = byRound.get("SF") ?? [];
  const finalMatch = (byRound.get("FINAL") ?? [])[0] ?? null;

  // Split into halves: first half on left, second half on right
  const r16L = padArr(r16.slice(0, 4), 4);
  const r16R = padArr(r16.slice(4, 8), 4);
  const qfL = padArr(qf.slice(0, 2), 2);
  const qfR = padArr(qf.slice(2, 4), 2);
  const sfL = sf[0] ?? null;
  const sfR = sf[1] ?? null;

  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="page-header">
        <h1 className="page-title">Bagan Turnamen</h1>
        <p className="page-title-sub">Sistem gugur — 16 Besar hingga Final.</p>
      </header>

      {r16.length === 0 && qf.length === 0 && sf.length === 0 && !finalMatch ? (
        <div className="surface" style={{ padding: 28, textAlign: "center" }}>
          <span className="muted">Bagan akan terisi setelah undian selesai.</span>
        </div>
      ) : (
        <div className="bracket-scroll">
          <div
            className="bracket-tree"
            style={{ width: TOTAL_W, height: TOTAL_H + 40 }}
          >
            {/* ---- LEFT SIDE ---- */}
            {r16L.map((m, i) => (
              <BracketCard
                key={`r16L-${i}`}
                match={m}
                x={COL_X.r16L}
                y={R16_TOPS[i]}
                align="left"
              />
            ))}
            {qfL.map((m, i) => (
              <BracketCard
                key={`qfL-${i}`}
                match={m}
                x={COL_X.qfL}
                y={QF_TOPS[i]}
                align="left"
              />
            ))}
            <BracketCard match={sfL} x={COL_X.sfL} y={SF_TOP} align="left" />

            {/* ---- FINAL ---- */}
            <BracketCard match={finalMatch} x={COL_X.final} y={FINAL_TOP} align="center" highlight />

            {/* ---- RIGHT SIDE ---- */}
            <BracketCard match={sfR} x={COL_X.sfR} y={SF_TOP} align="right" />
            {qfR.map((m, i) => (
              <BracketCard
                key={`qfR-${i}`}
                match={m}
                x={COL_X.qfR}
                y={QF_TOPS[i]}
                align="right"
              />
            ))}
            {r16R.map((m, i) => (
              <BracketCard
                key={`r16R-${i}`}
                match={m}
                x={COL_X.r16R}
                y={R16_TOPS[i]}
                align="right"
              />
            ))}

            {/* ---- ROUND LABELS ---- */}
            <RoundLabel x={COL_X.r16L} label={ROUND_LABEL.R16} />
            <RoundLabel x={COL_X.qfL} label={ROUND_LABEL.QF} />
            <RoundLabel x={COL_X.sfL} label={ROUND_LABEL.SF} />
            <RoundLabel x={COL_X.final} label={ROUND_LABEL.FINAL} highlight />
            <RoundLabel x={COL_X.sfR} label={ROUND_LABEL.SF} />
            <RoundLabel x={COL_X.qfR} label={ROUND_LABEL.QF} />
            <RoundLabel x={COL_X.r16R} label={ROUND_LABEL.R16} />

            {/* ---- TROPHY (above the final) ---- */}
            <Trophy x={COL_X.final} />

            {/* ---- CONNECTOR LINES ---- */}
            {/* R16-L pair 1 (M1+M2) → QF-L M1 */}
            <PairConnector
              fromX={COL_X.r16L + MATCH_W}
              y1={R16_TOPS[0] + MATCH_H / 2}
              y2={R16_TOPS[1] + MATCH_H / 2}
              toX={COL_X.qfL}
              toY={QF_TOPS[0] + MATCH_H / 2}
              side="L"
            />
            {/* R16-L pair 2 (M3+M4) → QF-L M2 */}
            <PairConnector
              fromX={COL_X.r16L + MATCH_W}
              y1={R16_TOPS[2] + MATCH_H / 2}
              y2={R16_TOPS[3] + MATCH_H / 2}
              toX={COL_X.qfL}
              toY={QF_TOPS[1] + MATCH_H / 2}
              side="L"
            />
            {/* QF-L pair → SF-L */}
            <PairConnector
              fromX={COL_X.qfL + MATCH_W}
              y1={QF_TOPS[0] + MATCH_H / 2}
              y2={QF_TOPS[1] + MATCH_H / 2}
              toX={COL_X.sfL}
              toY={SF_TOP + MATCH_H / 2}
              side="L"
            />
            {/* SF-L → Final */}
            <StraightConnector
              x1={COL_X.sfL + MATCH_W}
              x2={COL_X.final}
              y={SF_TOP + MATCH_H / 2}
            />

            {/* R16-R pair 1 (M1+M2) → QF-R M1 */}
            <PairConnector
              fromX={COL_X.r16R}
              y1={R16_TOPS[0] + MATCH_H / 2}
              y2={R16_TOPS[1] + MATCH_H / 2}
              toX={COL_X.qfR + MATCH_W}
              toY={QF_TOPS[0] + MATCH_H / 2}
              side="R"
            />
            {/* R16-R pair 2 (M3+M4) → QF-R M2 */}
            <PairConnector
              fromX={COL_X.r16R}
              y1={R16_TOPS[2] + MATCH_H / 2}
              y2={R16_TOPS[3] + MATCH_H / 2}
              toX={COL_X.qfR + MATCH_W}
              toY={QF_TOPS[1] + MATCH_H / 2}
              side="R"
            />
            {/* QF-R pair → SF-R */}
            <PairConnector
              fromX={COL_X.qfR}
              y1={QF_TOPS[0] + MATCH_H / 2}
              y2={QF_TOPS[1] + MATCH_H / 2}
              toX={COL_X.sfR + MATCH_W}
              toY={SF_TOP + MATCH_H / 2}
              side="R"
            />
            {/* SF-R → Final */}
            <StraightConnector
              x1={COL_X.final + MATCH_W}
              x2={COL_X.sfR}
              y={SF_TOP + MATCH_H / 2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- helpers ----

function padArr<T>(arr: T[], len: number): (T | null)[] {
  const out: (T | null)[] = arr.slice();
  while (out.length < len) out.push(null);
  return out;
}

function getWinner(m: Match | null): "home" | "away" | null {
  if (!m) return null;
  if (m.status !== "FINISHED") return null;
  if (m.homeScore == null || m.awayScore == null) return null;
  if (m.homeScore > m.awayScore) return "home";
  if (m.awayScore > m.homeScore) return "away";
  return null;
}

function BracketCard({
  match,
  x,
  y,
  align,
  highlight,
}: {
  match: Match | null;
  x: number;
  y: number;
  align: "left" | "right" | "center";
  highlight?: boolean;
}) {
  const winner = getWinner(match);
  const isLive = match?.status === "LIVE";
  const cardStyle: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    width: MATCH_W,
    height: MATCH_H,
  };

  if (!match) {
    return (
      <div className={`bracket-card empty${highlight ? " highlight" : ""}`} style={cardStyle}>
        <div className="bracket-row muted">
          <span>—</span>
          <span>-</span>
        </div>
        <div className="bracket-row muted">
          <span>—</span>
          <span>-</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/pertandingan/${match.id}`}
      className={`bracket-card${highlight ? " highlight" : ""}${isLive ? " live" : ""}`}
      style={cardStyle}
      title={`${match.home?.name ?? "TBD"} vs ${match.away?.name ?? "TBD"}`}
    >
      {isLive && (
        <div className="bracket-live-strip">
          <span className="live-dot" /> LIVE
        </div>
      )}
      <div className={`bracket-row${winner === "home" ? " win" : winner === "away" ? " lose" : ""}`}>
        <span className="bracket-team">
          <TeamCrest name={match.home?.name ?? "TBD"} url={match.home?.logoUrl ?? null} size={20} />
          <span className="bracket-name">{match.home?.name ?? "TBD"}</span>
        </span>
        <span className="bracket-score num">{match.homeScore ?? "-"}</span>
      </div>
      <div className={`bracket-row${winner === "away" ? " win" : winner === "home" ? " lose" : ""}`}>
        <span className="bracket-team">
          <TeamCrest name={match.away?.name ?? "TBD"} url={match.away?.logoUrl ?? null} size={20} />
          <span className="bracket-name">{match.away?.name ?? "TBD"}</span>
        </span>
        <span className="bracket-score num">{match.awayScore ?? "-"}</span>
      </div>
    </Link>
  );
}

function RoundLabel({
  x,
  label,
  highlight,
}: {
  x: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bracket-round-label${highlight ? " highlight" : ""}`}
      style={{
        position: "absolute",
        left: x,
        top: TOTAL_H + 12,
        width: MATCH_W,
      }}
    >
      {label}
    </div>
  );
}

function Trophy({ x }: { x: number }) {
  return (
    <div
      className="bracket-trophy"
      style={{
        position: "absolute",
        left: x,
        top: -16,
        width: MATCH_W,
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="Trofi juara"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    </div>
  );
}

function PairConnector({
  fromX,
  y1,
  y2,
  toX,
  toY,
  side,
}: {
  fromX: number;
  y1: number;
  y2: number;
  toX: number;
  toY: number;
  side: "L" | "R";
}) {
  const mid = side === "L" ? fromX + (toX - fromX) / 2 : toX + (fromX - toX) / 2;
  const lineLen = Math.abs(toX - fromX) / 2;
  const startX = side === "L" ? fromX : fromX - lineLen;

  return (
    <>
      {/* horizontal line from match 1 to mid */}
      <div className="bracket-line" style={{ left: startX, top: y1, width: lineLen, height: 1 }} />
      {/* horizontal line from match 2 to mid */}
      <div className="bracket-line" style={{ left: startX, top: y2, width: lineLen, height: 1 }} />
      {/* vertical line at mid */}
      <div className="bracket-line" style={{ left: mid, top: y1, width: 1, height: y2 - y1 }} />
      {/* horizontal line from mid to target */}
      <div
        className="bracket-line"
        style={{
          left: side === "L" ? mid : toX,
          top: toY,
          width: lineLen,
          height: 1,
        }}
      />
    </>
  );
}

function StraightConnector({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <div className="bracket-line" style={{ left: x1, top: y, width: x2 - x1, height: 1 }} />;
}
