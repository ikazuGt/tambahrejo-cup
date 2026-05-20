import { db } from "@/db/client";
import { referees } from "@/db/schema";
import { createReferee, deleteReferee, updateReferee } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminRefereesPage() {
  const list = await db.select().from(referees).orderBy(referees.name);

  async function handleCreate(formData: FormData) {
    "use server";
    await createReferee(null, formData);
  }
  async function handleUpdate(formData: FormData) {
    "use server";
    const rid = Number(formData.get("refereeId"));
    await updateReferee(rid, formData);
  }
  async function handleDelete(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    await deleteReferee(id);
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <h1 className="page-title">Wasit</h1>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Tambah Wasit</h2>
        <form action={handleCreate} className="form-grid" style={{ marginTop: 12 }}>
          <label className="field">
            <span>Nama</span>
            <input name="name" required className="input" />
          </label>
          <label className="field">
            <span>Peran</span>
            <select name="role" className="input" defaultValue="CENTER">
              <option value="CENTER">Wasit Tengah</option>
              <option value="LINESMAN">Hakim Garis</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary">Simpan</button>
        </form>
      </section>

      <section className="surface" style={{ padding: 14 }}>
        <h2 className="section-title">Daftar Wasit</h2>
        <div className="stack" style={{ gap: 10, marginTop: 12 }}>
          {list.map((r) => (
            <form
              key={r.id}
              action={handleUpdate}
              className="player-edit-row"
            >
              <input type="hidden" name="refereeId" value={r.id} />
              {r.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photoUrl}
                  alt={r.name}
                  style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border)", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--muted)", border: "1px solid var(--border)" }} />
              )}
              <input name="name" defaultValue={r.name} required className="input" placeholder="Nama" />
              <input name="photoUrl" defaultValue={r.photoUrl ?? ""} className="input" placeholder="URL foto" />
              <select name="role" className="input" defaultValue={r.role}>
                <option value="CENTER">Wasit Tengah</option>
                <option value="LINESMAN">Hakim Garis</option>
              </select>
              <span />
              <button type="submit" className="btn btn-primary btn-sm">Simpan</button>
            </form>
          ))}

          {list.length === 0 && <p className="muted">Belum ada wasit.</p>}

          {list.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary className="muted" style={{ fontSize: 12, cursor: "pointer" }}>Hapus wasit...</summary>
              <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                {list.map((r) => (
                  <form
                    key={`del-${r.id}`}
                    action={handleDelete}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", border: "1px solid var(--border)", borderRadius: 4 }}
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <span style={{ flex: 1, fontSize: 13 }}>{r.name} <span className="muted">({r.role === "CENTER" ? "Tengah" : "Hakim Garis"})</span></span>
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
