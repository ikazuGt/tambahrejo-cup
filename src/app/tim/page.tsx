import Link from "next/link";
import { getTeamsAll } from "@/lib/queries";
import { TeamCrest } from "@/components/team-crest";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function TimPage() {
  const teams = await getTeamsAll();
  return (
    <div className="stack" style={{ gap: 22 }}>
      <header className="page-header">
        <h1 className="page-title">Tim Peserta</h1>
        <p className="page-title-sub">{teams.length} tim bertanding di musim ini.</p>
      </header>
      <div className="team-grid">
        {teams.map((t) => (
          <Link key={t.id} href={`/tim/${t.id}`} className="team-card">
            <TeamCrest name={t.name} url={t.logoUrl} size={52} />
            <div className="team-card-info">
              <div className="team-card-name">{t.name}</div>
              <div className="team-card-origin">{t.origin}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
