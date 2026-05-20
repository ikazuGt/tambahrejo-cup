import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { cardEvents, goalEvents, matchPhotos, matches, players, teams } from "@/db/schema";
import {
  addCardEvent,
  addGoalEvent,
  addMatchPhoto,
  deleteMatch,
  deleteMatchPhoto,
  removeCardEvent,
  removeGoalEvent,
  updateMatchScore,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminMatchEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const matchId = Number(id);
  const m = await db.query.matches.findFirst({ where: eq(matches.id, matchId) });
  if (!m) notFound();

  const [home, away] = await Promise.all([
    m.homeTeamId ? db.query.teams.findFirst({ where: eq(teams.id, m.homeTeamId) }) : Promise.resolve(null),
    m.awayTeamId ? db.query.teams.findFirst({ where: eq(teams.id, m.awayTeamId) }) : Promise.resolve(null),
  ]);
  const [homePlayers, awayPlayers] = await Promise.all([
    m.homeTeamId
      ? db.select().from(players).where(eq(players.teamId, m.homeTeamId)).orderBy(players.jerseyNumber)
      : Promise.resolve([] as (typeof players.$inferSelect)[]),
    m.awayTeamId
      ? db.select().from(players).where(eq(players.teamId, m.awayTeamId)).orderBy(players.jerseyNumber)
      : Promise.resolve([] as (typeof players.$inferSelect)[]),
  ]);
  const playerMap = new Map([...homePlayers, ...awayPlayers].map((p) => [p.id, p]));

  const [goals, cards, photos] = await Promise.all([
    db.select().from(goalEvents).where(eq(goalEvents.matchId, matchId)).orderBy(goalEvents.minute),
    db.select().from(cardEvents).where(eq(cardEvents.matchId, matchId)).orderBy(cardEvents.minute),
    db.select().from(matchPhotos).where(eq(matchPhotos.matchId, matchId)),
  ]);

  async function handleScoreSave(formData: FormData) {
    "use server";
    await updateMatchScore(matchId, formData);
  }
  async function handleAddGoal(formData: FormData) {
    "use server";
    await addGoalEvent(matchId, formData);
  }
  async function handleAddCard(formData: FormData) {
    "use server";
    await addCardEvent(matchId, formData);
  }
  async function handleRemoveGoal(formData: FormData) {
    "use server";
    await removeGoalEvent(Number(formData.get("id")), matchId);
  }
  async function handleRemoveCard(formData: FormData) {
    "use server";
    await removeCardEvent(Number(formData.get("id")), matchId);
  }
  async function handleDeleteMatch() {
    "use server";
    await deleteMatch(matchId);
  }
  async function handleAddPhoto(formData: FormData) {
    "use server";
    await addMatchPhoto(matchId, formData);
  }
  async function handleRemovePhoto(formData: FormData) {
    "use server";
    await deleteMatchPhoto(Number(formData.get("id")), matchId);
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <Link href="/admin/matches" className="muted" style={{ fontSize: 13 }}>← Kembali</Link>
      <h1 className="page-title">
        {home?.name} <span className="muted">vs</span> {away?.name}
      </h1>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Skor & Status</h2>
        <form action={handleScoreSave} className="form-grid">
          <label className="field">
            <span>Skor {home?.name}</span>
            <input name="homeScore" type="number" min={0} className="input num" defaultValue={m.homeScore ?? ""} />
          </label>
          <label className="field">
            <span>Skor {away?.name}</span>
            <input name="awayScore" type="number" min={0} className="input num" defaultValue={m.awayScore ?? ""} />
          </label>
          <label className="field">
            <span>Status</span>
            <select name="status" className="input" defaultValue={m.status}>
              <option value="SCHEDULED">Jadwal</option>
              <option value="LIVE">LIVE</option>
              <option value="FINISHED">Selesai</option>
              <option value="POSTPONED">Ditunda</option>
            </select>
          </label>
          <label className="field">
            <span>Man of the Match</span>
            <select name="motmPlayerId" className="input" defaultValue={m.motmPlayerId ?? ""}>
              <option value="">— tidak ada —</option>
              <optgroup label={home?.name}>
                {homePlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.jerseyNumber} {p.name}</option>
                ))}
              </optgroup>
              <optgroup label={away?.name}>
                {awayPlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.jerseyNumber} {p.name}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span>URL Live Stream (untuk match LIVE)</span>
            <input name="livestreamUrl" className="input" defaultValue={m.livestreamUrl ?? ""} placeholder="https://www.youtube.com/watch?v=... atau facebook.com/..." />
          </label>
          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span>URL Video Cuplikan (highlight setelah match)</span>
            <input name="highlightVideoUrl" className="input" defaultValue={m.highlightVideoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
          </label>
          <button type="submit" className="btn btn-primary">Simpan</button>
        </form>
      </section>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Tambah Gol</h2>
        <form action={handleAddGoal} className="form-grid">
          <label className="field">
            <span>Menit</span>
            <input name="minute" type="number" min={1} max={130} required className="input num" />
          </label>
          <label className="field">
            <span>Pemain</span>
            <select name="playerId" required className="input">
              <optgroup label={home?.name}>
                {homePlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.jerseyNumber} {p.name}</option>
                ))}
              </optgroup>
              <optgroup label={away?.name}>
                {awayPlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.jerseyNumber} {p.name}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="field">
            <span>Tipe</span>
            <select name="type" className="input" defaultValue="GOAL">
              <option value="GOAL">Gol</option>
              <option value="PENALTY">Penalti</option>
              <option value="OWN_GOAL">Bunuh Diri</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Tambah</button>
        </form>
        <div style={{ marginTop: 10 }}>
          {goals.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Belum ada gol.</p>
          ) : (
            goals.map((g) => {
              const p = playerMap.get(g.playerId);
              return (
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                  <span className="num muted" style={{ width: 40 }}>{g.minute}&apos;</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    ⚽ {p ? `${p.name} #${p.jerseyNumber}` : `Player ${g.playerId}`}{" "}
                    <span className="muted" style={{ fontSize: 12 }}>({g.type})</span>
                  </span>
                  <form action={handleRemoveGoal}>
                    <input type="hidden" name="id" value={g.id} />
                    <button type="submit" className="btn btn-danger" style={{ fontSize: 12, padding: "6px 10px", minHeight: 0 }}>Hapus</button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Tambah Kartu</h2>
        <form action={handleAddCard} className="form-grid">
          <label className="field">
            <span>Menit</span>
            <input name="minute" type="number" min={1} max={130} required className="input num" />
          </label>
          <label className="field">
            <span>Pemain</span>
            <select name="playerId" required className="input">
              <optgroup label={home?.name}>
                {homePlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.jerseyNumber} {p.name}</option>
                ))}
              </optgroup>
              <optgroup label={away?.name}>
                {awayPlayers.map((p) => (
                  <option key={p.id} value={p.id}>#{p.jerseyNumber} {p.name}</option>
                ))}
              </optgroup>
            </select>
          </label>
          <label className="field">
            <span>Warna</span>
            <select name="type" className="input" defaultValue="YELLOW">
              <option value="YELLOW">Kuning</option>
              <option value="RED">Merah</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Tambah</button>
        </form>
        <div style={{ marginTop: 10 }}>
          {cards.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Belum ada kartu.</p>
          ) : (
            cards.map((c) => {
              const p = playerMap.get(c.playerId);
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                  <span className="num muted" style={{ width: 40 }}>{c.minute}&apos;</span>
                  <span className={c.type === "YELLOW" ? "yellow-card" : "red-card"} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {p ? `${p.name} #${p.jerseyNumber}` : `Player ${c.playerId}`}
                  </span>
                  <form action={handleRemoveCard}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="btn btn-danger" style={{ fontSize: 12, padding: "6px 10px", minHeight: 0 }}>Hapus</button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* PHOTOS */}
      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Foto Pertandingan</h2>
        <form action={handleAddPhoto} className="form-grid" style={{ marginTop: 12 }}>
          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span>URL Foto</span>
            <input name="url" className="input" required placeholder="https://..." />
          </label>
          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span>Caption (opsional)</span>
            <input name="caption" className="input" placeholder="Aksi gol di menit 23..." />
          </label>
          <button type="submit" className="btn btn-primary">Tambah Foto</button>
        </form>
        <div style={{ marginTop: 10 }}>
          {photos.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>Belum ada foto.</p>
          ) : (
            <div className="photo-grid" style={{ marginTop: 10 }}>
              {photos.map((p) => (
                <div key={p.id} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption ?? ""} loading="lazy" />
                  <form action={handleRemovePhoto} style={{ position: "absolute", top: 4, right: 4 }}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn btn-danger" style={{ fontSize: 11, padding: "4px 8px", minHeight: 0 }}>Hapus</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: 4 }}>
        <form action={handleDeleteMatch}>
          <button type="submit" className="btn btn-danger">
            Hapus Pertandingan
          </button>
        </form>
      </section>
    </div>
  );
}
