import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="admin-bar">
        <div className="admin-nav">
          <strong style={{ fontSize: 12, letterSpacing: "0.08em" }}>ADMIN</strong>
          <a href="/admin">Dashboard</a>
          <a href="/admin/teams">Tim</a>
          <a href="/admin/referees">Wasit</a>
          <a href="/admin/bracket">Bagan Pertandingan</a>
        </div>
        {session?.user && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn" style={{ fontSize: 12, padding: "6px 10px", minHeight: 0 }}>
              Keluar
            </button>
          </form>
        )}
      </div>
      {children}
    </div>
  );
}
