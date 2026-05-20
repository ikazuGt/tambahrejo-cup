import { db } from "@/db/client";
import { matches, referees, teams } from "@/db/schema";
import { ROUND_LABEL } from "@/lib/utils";
import { generateBracket } from "../actions";
import { AdminBracket } from "./admin-bracket";

export const dynamic = "force-dynamic";

export default async function AdminBracketPage() {
  const [allMatches, allTeams, allReferees] = await Promise.all([
    db.select().from(matches).orderBy(matches.bracketSlot),
    db.select().from(teams).orderBy(teams.name),
    db.select().from(referees).orderBy(referees.name),
  ]);

  async function handleGenerate() {
    "use server";
    await generateBracket();
  }

  return (
    <div className="stack" style={{ gap: 18 }}>
      <header className="page-header">
        <h1 className="page-title">Bagan Pertandingan</h1>
        <p className="page-title-sub">
          Klik pada slot tim untuk mengisi atau mengubah. Pemenang otomatis maju ke babak berikutnya.
        </p>
      </header>

      {allMatches.length === 0 ? (
        <div className="surface" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ marginBottom: 16 }}>
            Bagan belum dibuat. Klik tombol di bawah untuk membuat struktur 16 Besar → Final.
          </p>
          <form action={handleGenerate}>
            <button type="submit" className="btn btn-primary">
              Buat Bagan Turnamen
            </button>
          </form>
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Akan membuat 15 slot pertandingan kosong (8 R16 + 4 QF + 2 SF + 1 Final).
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <form action={handleGenerate}>
              <button
                type="submit"
                className="btn btn-danger btn-sm"
                title="Hapus semua pertandingan dan buat bagan baru"
              >
                Reset Bagan
              </button>
            </form>
          </div>
          <AdminBracket
            matches={allMatches}
            teams={allTeams}
            referees={allReferees}
            roundLabels={ROUND_LABEL}
          />
        </>
      )}
    </div>
  );
}
