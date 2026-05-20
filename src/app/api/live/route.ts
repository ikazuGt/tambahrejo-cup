import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { matches, teams } from "@/db/schema";
import { ROUND_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const liveMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.status, "LIVE"));

  if (liveMatches.length === 0) {
    return NextResponse.json([]);
  }

  const allTeams = await db.select().from(teams);
  const teamMap = new Map(allTeams.map((t) => [t.id, t]));

  const result = liveMatches.map((m) => {
    const home = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
    const away = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;

    return {
      id: m.id,
      homeTeamName: home?.name ?? "TBD",
      awayTeamName: away?.name ?? "TBD",
      homeTeamLogo: home?.logoUrl ?? null,
      awayTeamLogo: away?.logoUrl ?? null,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      livestreamUrl: m.livestreamUrl ?? null,
      round: ROUND_LABEL[m.round] ?? m.round,
    };
  });

  return NextResponse.json(result);
}
