"use client";

import { useState, useTransition } from "react";
import { quickEditMatch } from "../actions";

type Match = {
  id: number;
  round: "R32" | "R16" | "QF" | "SF" | "FINAL";
  bracketSlot: number | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
  kickoffAt: Date;
  venue: string;
  centerRefereeId: number | null;
  linesman1Id: number | null;
  linesman2Id: number | null;
  livestreamUrl: string | null;
  highlightVideoUrl: string | null;
};

type Team = { id: number; name: string; logoUrl: string | null };
type Referee = { id: number; name: string; role: "CENTER" | "LINESMAN" };

type Props = {
  matches: Match[];
  teams: Team[];
  referees: Referee[];
  roundLabels: Record<string, string>;
};

const MATCH_W = 200;
const MATCH_H = 80;
const ROW_GAP = 18;
const COL_GAP = 36;
const COL_W = MATCH_W + COL_GAP;

const R16_TOPS = [0, 1, 2, 3].map((i) => i * (MATCH_H + ROW_GAP));
const QF_TOPS = [
  (R16_TOPS[0] + R16_TOPS[1]) / 2,
  (R16_TOPS[2] + R16_TOPS[3]) / 2,
];
const SF_TOP = (QF_TOPS[0] + QF_TOPS[1]) / 2;
const FINAL_TOP = SF_TOP;
const TOTAL_W = 7 * MATCH_W + 6 * COL_GAP;
const TOTAL_H = R16_TOPS[3] + MATCH_H;

const COL_X: Record<string, number> = {
  r16L: 0, qfL: COL_W, sfL: 2 * COL_W, final: 3 * COL_W,
  sfR: 4 * COL_W, qfR: 5 * COL_W, r16R: 6 * COL_W,
};

export function AdminBracket({ matches, teams, referees, roundLabels }: Props) {
  const [editing, setEditing] = useState<Match | null>(null);
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  const r16 = matches.filter((m) => m.round === "R16").sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));
  const qf = matches.filter((m) => m.round === "QF").sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));
  const sf = matches.filter((m) => m.round === "SF").sort((a, b) => (a.bracketSlot ?? 0) - (b.bracketSlot ?? 0));
  const finalMatch = matches.find((m) => m.round === "FINAL") ?? null;

  return (
    <>
      <div className="bracket-scroll">
        <div className="bracket-tree" style={{ width: TOTAL_W, height: TOTAL_H + 40 }}>
          {/* Left side */}
          {r16.slice(0, 4).map((m, i) => (
            <Slot key={m.id} match={m} teamMap={teamMap} x={COL_X.r16L} y={R16_TOPS[i]} onEdit={setEditing} />
          ))}
          {qf.slice(0, 2).map((m, i) => (
            <Slot key={m.id} match={m} teamMap={teamMap} x={COL_X.qfL} y={QF_TOPS[i]} onEdit={setEditing} />
          ))}
          {sf[0] && <Slot match={sf[0]} teamMap={teamMap} x={COL_X.sfL} y={SF_TOP} onEdit={setEditing} />}

          {/* Final */}
          {finalMatch && (
            <Slot match={finalMatch} teamMap={teamMap} x={COL_X.final} y={FINAL_TOP} onEdit={setEditing} highlight />
          )}

          {/* Right side */}
          {sf[1] && <Slot match={sf[1]} teamMap={teamMap} x={COL_X.sfR} y={SF_TOP} onEdit={setEditing} />}
          {qf.slice(2, 4).map((m, i) => (
            <Slot key={m.id} match={m} teamMap={teamMap} x={COL_X.qfR} y={QF_TOPS[i]} onEdit={setEditing} />
          ))}
          {r16.slice(4, 8).map((m, i) => (
            <Slot key={m.id} match={m} teamMap={teamMap} x={COL_X.r16R} y={R16_TOPS[i]} onEdit={setEditing} />
          ))}

          {/* Round labels */}
          {(["r16L", "qfL", "sfL", "final", "sfR", "qfR", "r16R"] as const).map((col) => {
            const round = col.startsWith("r16") ? "R16" : col.startsWith("qf") ? "QF" : col.startsWith("sf") ? "SF" : "FINAL";
            return (
              <div
                key={col}
                className={`bracket-round-label${col === "final" ? " highlight" : ""}`}
                style={{ position: "absolute", left: COL_X[col], top: TOTAL_H + 12, width: MATCH_W }}
              >
                {roundLabels[round]}
              </div>
            );
          })}

          {/* Connector lines */}
          {[0, 2].map((i) => (
            <PairConnector
              key={`l-${i}`}
              fromX={COL_X.r16L + MATCH_W}
              y1={R16_TOPS[i] + MATCH_H / 2}
              y2={R16_TOPS[i + 1] + MATCH_H / 2}
              toX={COL_X.qfL}
              toY={QF_TOPS[i / 2] + MATCH_H / 2}
              side="L"
            />
          ))}
          <PairConnector fromX={COL_X.qfL + MATCH_W} y1={QF_TOPS[0] + MATCH_H / 2} y2={QF_TOPS[1] + MATCH_H / 2} toX={COL_X.sfL} toY={SF_TOP + MATCH_H / 2} side="L" />
          <StraightConnector x1={COL_X.sfL + MATCH_W} x2={COL_X.final} y={SF_TOP + MATCH_H / 2} />

          {[0, 2].map((i) => (
            <PairConnector
              key={`r-${i}`}
              fromX={COL_X.r16R}
              y1={R16_TOPS[i] + MATCH_H / 2}
              y2={R16_TOPS[i + 1] + MATCH_H / 2}
              toX={COL_X.qfR + MATCH_W}
              toY={QF_TOPS[i / 2] + MATCH_H / 2}
              side="R"
            />
          ))}
          <PairConnector fromX={COL_X.qfR} y1={QF_TOPS[0] + MATCH_H / 2} y2={QF_TOPS[1] + MATCH_H / 2} toX={COL_X.sfR + MATCH_W} toY={SF_TOP + MATCH_H / 2} side="R" />
          <StraightConnector x1={COL_X.final + MATCH_W} x2={COL_X.sfR} y={SF_TOP + MATCH_H / 2} />
        </div>
      </div>

      {editing && (
        <EditDialog
          match={editing}
          teams={teams}
          referees={referees}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function Slot({
  match,
  teamMap,
  x,
  y,
  onEdit,
  highlight,
}: {
  match: Match;
  teamMap: Map<number, Team>;
  x: number;
  y: number;
  onEdit: (m: Match) => void;
  highlight?: boolean;
}) {
  const home = match.homeTeamId ? teamMap.get(match.homeTeamId) : null;
  const away = match.awayTeamId ? teamMap.get(match.awayTeamId) : null;
  const finished = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const winner =
    finished && match.homeScore != null && match.awayScore != null
      ? match.homeScore > match.awayScore ? "home" : match.awayScore > match.homeScore ? "away" : null
      : null;

  return (
    <button
      type="button"
      onClick={() => onEdit(match)}
      className={`admin-slot${highlight ? " highlight" : ""}${live ? " live" : ""}`}
      style={{ position: "absolute", left: x, top: y, width: MATCH_W, height: MATCH_H }}
    >
      {live && <div className="bracket-live-strip"><span className="live-dot" /> LIVE</div>}
      <div className={`admin-slot-row${winner === "home" ? " win" : winner === "away" ? " lose" : ""}`}>
        {home?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={home.logoUrl} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />
        ) : (
          <span className="admin-slot-placeholder" />
        )}
        <span className="admin-slot-name">{home?.name ?? "TBD"}</span>
        <span className="admin-slot-score num">{match.homeScore ?? "-"}</span>
      </div>
      <div className={`admin-slot-row${winner === "away" ? " win" : winner === "home" ? " lose" : ""}`}>
        {away?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={away.logoUrl} alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />
        ) : (
          <span className="admin-slot-placeholder" />
        )}
        <span className="admin-slot-name">{away?.name ?? "TBD"}</span>
        <span className="admin-slot-score num">{match.awayScore ?? "-"}</span>
      </div>
    </button>
  );
}

function PairConnector({
  fromX, y1, y2, toX, toY, side,
}: { fromX: number; y1: number; y2: number; toX: number; toY: number; side: "L" | "R" }) {
  const lineLen = Math.abs(toX - fromX) / 2;
  const startX = side === "L" ? fromX : fromX - lineLen;
  const mid = side === "L" ? fromX + lineLen : toX + lineLen;
  return (
    <>
      <div className="bracket-line" style={{ left: startX, top: y1, width: lineLen, height: 1 }} />
      <div className="bracket-line" style={{ left: startX, top: y2, width: lineLen, height: 1 }} />
      <div className="bracket-line" style={{ left: mid, top: y1, width: 1, height: y2 - y1 }} />
      <div className="bracket-line" style={{ left: side === "L" ? mid : toX, top: toY, width: lineLen, height: 1 }} />
    </>
  );
}

function StraightConnector({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <div className="bracket-line" style={{ left: x1, top: y, width: x2 - x1, height: 1 }} />;
}

// ---------- Edit dialog ----------

function EditDialog({
  match,
  teams,
  referees,
  onClose,
}: {
  match: Match;
  teams: Team[];
  referees: Referee[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const centers = referees.filter((r) => r.role === "CENTER");
  const lines = referees.filter((r) => r.role === "LINESMAN");

  function isoLocal(d: Date) {
    const dd = new Date(d);
    dd.setMinutes(dd.getMinutes() - dd.getTimezoneOffset());
    return dd.toISOString().slice(0, 16);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await quickEditMatch(match.id, formData);
      onClose();
    });
  }

  return (
    <div className="img-modal-backdrop" onClick={onClose}>
      <div className="admin-edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="admin-edit-header">
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Edit Pertandingan</h3>
          <button type="button" className="img-modal-close" onClick={onClose} style={{ position: "static" }} aria-label="Tutup">✕</button>
        </div>

        <form action={handleSubmit} className="stack" style={{ gap: 14, padding: 18 }}>
          <div className="form-grid">
            <label className="field">
              <span>Tim Tuan Rumah</span>
              <select name="homeTeamId" className="input" defaultValue={match.homeTeamId ?? ""}>
                <option value="">— TBD —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Tim Tamu</span>
              <select name="awayTeamId" className="input" defaultValue={match.awayTeamId ?? ""}>
                <option value="">— TBD —</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Skor Tuan Rumah</span>
              <input name="homeScore" type="number" min={0} className="input num" defaultValue={match.homeScore ?? ""} />
            </label>
            <label className="field">
              <span>Skor Tamu</span>
              <input name="awayScore" type="number" min={0} className="input num" defaultValue={match.awayScore ?? ""} />
            </label>
            <label className="field">
              <span>Status</span>
              <select name="status" className="input" defaultValue={match.status}>
                <option value="SCHEDULED">Jadwal</option>
                <option value="LIVE">LIVE</option>
                <option value="FINISHED">Selesai</option>
                <option value="POSTPONED">Ditunda</option>
              </select>
            </label>
            <label className="field">
              <span>Kick Off</span>
              <input name="kickoffAt" type="datetime-local" className="input" defaultValue={isoLocal(match.kickoffAt)} />
            </label>
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span>Lapangan</span>
              <input name="venue" className="input" defaultValue={match.venue} />
            </label>
            <label className="field">
              <span>Wasit Tengah</span>
              <select name="centerRefereeId" className="input" defaultValue={match.centerRefereeId ?? ""}>
                <option value="">— pilih —</option>
                {centers.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Hakim Garis 1</span>
              <select name="linesman1Id" className="input" defaultValue={match.linesman1Id ?? ""}>
                <option value="">— pilih —</option>
                {lines.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Hakim Garis 2</span>
              <select name="linesman2Id" className="input" defaultValue={match.linesman2Id ?? ""}>
                <option value="">— pilih —</option>
                {lines.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span>URL Live Stream (YouTube/Facebook Live)</span>
              <input name="livestreamUrl" className="input" defaultValue={match.livestreamUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            <a href={`/admin/matches/${match.id}`} className="btn btn-sm">
              Edit Detail (Gol/Kartu/MOTM)
            </a>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn" onClick={onClose} disabled={pending}>Batal</button>
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
          <p className="muted" style={{ fontSize: 11, margin: 0 }}>
            💡 Jika status diset &quot;Selesai&quot; dan ada pemenang, tim akan otomatis maju ke babak berikutnya.
          </p>
        </form>
      </div>
    </div>
  );
}
