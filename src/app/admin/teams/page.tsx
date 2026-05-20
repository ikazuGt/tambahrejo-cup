import { db } from "@/db/client";
import { players, teams } from "@/db/schema";
import { sql } from "drizzle-orm";
import { createTeam, deleteTeam, updateTeam } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const list = await db
    .select({
      id: teams.id,
      name: teams.name,
      origin: teams.origin,
      managerName: teams.managerName,
      logoUrl: teams.logoUrl,
      teamPhotoUrl: teams.teamPhotoUrl,
      playerCount: sql<number>`(SELECT COUNT(*) FROM ${players} WHERE ${players.teamId} = ${teams.id})`,
    })
    .from(teams)
    .orderBy(teams.name);

  async function handleCreate(formData: FormData) {
    "use server";
    await createTeam(null, formData);
  }
  async function handleUpdate(formData: FormData) {
    "use server";
    const tid = Number(formData.get("teamId"));
    await updateTeam(tid, formData);
  }
  async function handleDelete(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await deleteTeam(id);
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <h1 className="page-title">Tim</h1>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Tambah Tim</h2>
        <form action={handleCreate} className="form-grid" style={{ marginTop: 12 }}>
          <label className="field">
            <span>Nama Tim</span>
            <input name="name" required className="input" />
          </label>
          <label className="field">
            <span>Asal</span>
            <input name="origin" required className="input" />
          </label>
          <label className="field">
            <span>Manager</span>
            <input name="managerName" required className="input" />
          </label>
          <label className="field">
            <span>URL Logo</span>
            <input name="logoUrl" className="input" placeholder="https://..." />
          </label>
          <label className="field">
            <span>URL Foto Tim</span>
            <input name="teamPhotoUrl" className="input" placeholder="https://..." />
          </label>
          <button type="submit" className="btn btn-primary">Simpan</button>
        </form>
      </section>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Daftar Tim</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          Edit data tim atau buka halaman pemain untuk kelola skuad.
        </p>
        <div className="stack" style={{ gap: 12, marginTop: 12 }}>
          {list.map((t) => (
            <form
              key={t.id}
              action={handleUpdate}
              className="team-edit-row"
            >
              <input type="hidden" name="teamId" value={t.id} />
              {t.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.logoUrl} alt={t.name} style={{ width: 48, height: 48, borderRadius: 6, border: "1px solid var(--border)", objectFit: "contain" }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--muted)", border: "1px solid var(--border)" }} />
              )}
              <div className="team-edit-fields">
                <input name="name" defaultValue={t.name} required className="input" placeholder="Nama tim" />
                <input name="origin" defaultValue={t.origin} required className="input" placeholder="Asal" />
                <input name="managerName" defaultValue={t.managerName} required className="input" placeholder="Manager" />
                <input name="logoUrl" defaultValue={t.logoUrl ?? ""} className="input" placeholder="URL logo" />
                <input name="teamPhotoUrl" defaultValue={t.teamPhotoUrl ?? ""} className="input" placeholder="URL foto tim" />
              </div>
              <div className="team-edit-actions">
                <span className="muted" style={{ fontSize: 11 }}>{Number(t.playerCount)} pemain</span>
                <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
                <a href={`/admin/teams/${t.id}`} className="btn btn-sm">Pemain →</a>
              </div>
            </form>
          ))}
          {list.length === 0 && <p className="muted">Belum ada tim.</p>}

          {list.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary className="muted" style={{ fontSize: 12, cursor: "pointer" }}>Hapus tim...</summary>
              <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                {list.map((t) => (
                  <form
                    key={`del-${t.id}`}
                    action={handleDelete}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 4 }}
                  >
                    <input type="hidden" name="id" value={t.id} />
                    <span style={{ flex: 1, fontSize: 13 }}>{t.name}</span>
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
