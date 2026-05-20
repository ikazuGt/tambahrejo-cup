import Link from "next/link";
import { db } from "@/db/client";
import { matches, referees, teams } from "@/db/schema";
import { createMatch } from "../actions";
import { ROUND_LABEL, ROUND_ORDER, formatDateID, formatTimeID, STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const [list, allTeams, allReferees] = await Promise.all([
    db.select().from(matches).orderBy(matches.kickoffAt),
    db.select().from(teams).orderBy(teams.name),
    db.select().from(referees).orderBy(referees.name),
  ]);
  const teamMap = new Map(allTeams.map((t) => [t.id, t]));
  const centers = allReferees.filter((r) => r.role === "CENTER");
  const lines = allReferees.filter((r) => r.role === "LINESMAN");

  async function handleCreate(formData: FormData) {
    "use server";
    await createMatch(null, formData);
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <h1 className="page-title">Pertandingan</h1>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Buat Pertandingan</h2>
        <form action={handleCreate} className="form-grid">
          <label className="field">
            <span>Babak</span>
            <select name="round" className="input" defaultValue="GROUP_W1">
              {ROUND_ORDER.map((r) => (
                <option key={r} value={r}>{ROUND_LABEL[r]}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Grup (opsional)</span>
            <input name="groupName" className="input" placeholder="Grup A" />
          </label>
          <label className="field">
            <span>Tim Tuan Rumah</span>
            <select name="homeTeamId" className="input" required>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tim Tamu</span>
            <select name="awayTeamId" className="input" required>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Kick Off</span>
            <input name="kickoffAt" type="datetime-local" required className="input" />
          </label>
          <label className="field">
            <span>Lapangan</span>
            <input name="venue" className="input" defaultValue="Lapangan Tambahrejo" />
          </label>
          <label className="field">
            <span>Wasit Tengah</span>
            <select name="centerRefereeId" className="input">
              <option value="">— pilih —</option>
              {centers.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Hakim Garis 1</span>
            <select name="linesman1Id" className="input">
              <option value="">— pilih —</option>
              {lines.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Hakim Garis 2</span>
            <select name="linesman2Id" className="input">
              <option value="">— pilih —</option>
              {lines.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Buat</button>
        </form>
      </section>

      <div className="surface table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="l">Tanggal</th>
              <th className="l">Babak</th>
              <th className="l">Pertandingan</th>
              <th>Skor</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id}>
                <td className="num l">
                  {formatDateID(m.kickoffAt)} · {formatTimeID(m.kickoffAt)}
                </td>
                <td className="l">{ROUND_LABEL[m.round]}{m.groupName ? ` · ${m.groupName}` : ""}</td>
                <td className="l">
                  <strong>{m.homeTeamId ? teamMap.get(m.homeTeamId)?.name ?? "TBD" : "TBD"}</strong>{" "}
                  <span className="muted">vs</span>{" "}
                  <strong>{m.awayTeamId ? teamMap.get(m.awayTeamId)?.name ?? "TBD" : "TBD"}</strong>
                </td>
                <td className="num">
                  {m.homeScore != null ? `${m.homeScore} - ${m.awayScore}` : "-"}
                </td>
                <td>{STATUS_LABEL[m.status]}</td>
                <td style={{ textAlign: "right" }}>
                  <Link className="btn" href={`/admin/matches/${m.id}`} style={{ fontSize: 12, padding: "6px 10px", minHeight: 0 }}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
