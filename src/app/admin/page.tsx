import { getDashboardCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const c = await getDashboardCounts();
  const cards = [
    { label: "Tim", value: c.teams },
    { label: "Pemain", value: c.players },
    { label: "Pertandingan", value: c.matches },
    { label: "Selesai", value: c.finished },
    { label: "Akan Datang", value: c.scheduled },
  ];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <h1 className="page-title">Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {cards.map((c) => (
          <div key={c.label} className="surface" style={{ padding: 14 }}>
            <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {c.label}
            </div>
            <div className="num" style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
