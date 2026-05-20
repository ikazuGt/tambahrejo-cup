import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { players, teams } from "@/db/schema";
import { createPlayer, deletePlayer, updatePlayer } from "../../actions";

export const dynamic = "force-dynamic";

export default async function AdminTeamDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamId = Number(id);
  const team = await db.query.teams.findFirst({ where: eq(teams.id, teamId) });
  if (!team) notFound();
  const list = await db
    .select()
    .from(players)
    .where(eq(players.teamId, teamId))
    .orderBy(players.jerseyNumber);

  async function handleCreate(formData: FormData) {
    "use server";
    await createPlayer(teamId, formData);
  }
  async function handleUpdate(formData: FormData) {
    "use server";
    const pid = Number(formData.get("playerId"));
    await updatePlayer(pid, formData);
  }
  async function handleDelete(formData: FormData) {
    "use server";
    const pid = Number(formData.get("id"));
    await deletePlayer(pid);
  }

  return (
    <div className="stack" style={{ gap: 16 }}>
      <a href="/admin/teams" className="muted" style={{ fontSize: 13 }}>← Kembali</a>
      <h1 className="page-title">{team.name}</h1>
      <div className="muted" style={{ fontSize: 13 }}>{team.origin} · Manager {team.managerName}</div>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Tambah Pemain</h2>
        <form action={handleCreate} className="form-grid" style={{ marginTop: 12 }}>
          <label className="field">
            <span>Nama</span>
            <input name="name" required className="input" />
          </label>
          <label className="field">
            <span>No. Punggung</span>
            <input name="jerseyNumber" type="number" min={1} max={99} required className="input num" />
          </label>
          <label className="field">
            <span>Posisi</span>
            <select name="position" required className="input" defaultValue="MID">
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="MID">MID</option>
              <option value="FWD">FWD</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Simpan</button>
        </form>
      </section>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Daftar Pemain</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          Edit nama, nomor, posisi, atau URL foto. Tekan Simpan di tiap baris.
        </p>
        <div className="stack" style={{ gap: 10, marginTop: 12 }}>
          {list.map((p) => (
            <form
              key={p.id}
              action={handleUpdate}
              className="player-edit-row"
            >
              <input type="hidden" name="playerId" value={p.id} />
              {p.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border)", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--muted)", border: "1px solid var(--border)" }} />
              )}
              <input name="name" defaultValue={p.name} required className="input" placeholder="Nama" />
              <input name="photoUrl" defaultValue={p.photoUrl ?? ""} className="input" placeholder="URL foto" />
              <input name="jerseyNumber" type="number" min={1} max={99} required className="input num" defaultValue={p.jerseyNumber} />
              <select name="position" className="input" defaultValue={p.position}>
                <option value="GK">GK</option>
                <option value="DEF">DEF</option>
                <option value="MID">MID</option>
                <option value="FWD">FWD</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
            </form>
          ))}
          {list.length === 0 && <p className="muted">Belum ada pemain.</p>}

          {list.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary className="muted" style={{ fontSize: 12, cursor: "pointer" }}>Hapus pemain...</summary>
              <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                {list.map((p) => (
                  <form
                    key={`del-${p.id}`}
                    action={handleDelete}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 4 }}
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <span className="num muted" style={{ width: 28, fontSize: 12 }}>#{p.jerseyNumber}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                    <button type="submit" className="btn btn-danger btn-sm">Hapus</button>
                  </form>
                ))}
              </div>
            </details>
          )}
        </div>
      </section>
    </div>
  );
}
