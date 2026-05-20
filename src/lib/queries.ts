import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  cardEvents,
  goalEvents,
  matchPhotos,
  matches,
  players,
  referees,
  teams,
} from "@/db/schema";

export type MatchListItem = Awaited<ReturnType<typeof getMatches>>[number];

export async function getMatches(opts?: {
  status?: "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED";
}) {
  const rows = await db
    .select({
      id: matches.id,
      round: matches.round,
      groupName: matches.groupName,
      kickoffAt: matches.kickoffAt,
      venue: matches.venue,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
    })
    .from(matches)
    .where(opts?.status ? eq(matches.status, opts.status) : sql`1=1`)
    .orderBy(matches.kickoffAt);

  // batch fetch team info — handle nulls (placeholder bracket slots)
  const teamIds = Array.from(
    new Set(rows.flatMap((r) => [r.homeTeamId, r.awayTeamId]).filter((id): id is number => id !== null))
  );
  const teamRows = teamIds.length
    ? await db
        .select({ id: teams.id, name: teams.name, logoUrl: teams.logoUrl, origin: teams.origin })
        .from(teams)
        .where(sql`${teams.id} IN (${sql.join(teamIds.map((id) => sql`${id}`), sql`, `)})`)
    : [];
  const teamMap = new Map(teamRows.map((t) => [t.id, t]));

  return rows.map((r) => ({
    ...r,
    home: r.homeTeamId ? teamMap.get(r.homeTeamId) ?? null : null,
    away: r.awayTeamId ? teamMap.get(r.awayTeamId) ?? null : null,
  }));
}

export async function getUpcomingMatches(limit = 5) {
  const all = await getMatches();
  const now = new Date();
  return all
    .filter((m) => m.status === "SCHEDULED" && m.kickoffAt >= now && m.home && m.away)
    .slice(0, limit);
}

export async function getRecentResults(limit = 5) {
  const all = await getMatches({ status: "FINISHED" });
  return all.slice(-limit).reverse();
}

export async function getMatchDetail(id: number) {
  const m = await db.query.matches.findFirst({ where: eq(matches.id, id) });
  if (!m) return null;

  const [home, away, goalsRaw, cardsRaw, photosRaw] = await Promise.all([
    m.homeTeamId ? db.query.teams.findFirst({ where: eq(teams.id, m.homeTeamId) }) : Promise.resolve(null),
    m.awayTeamId ? db.query.teams.findFirst({ where: eq(teams.id, m.awayTeamId) }) : Promise.resolve(null),
    db.select().from(goalEvents).where(eq(goalEvents.matchId, id)),
    db.select().from(cardEvents).where(eq(cardEvents.matchId, id)),
    db.select().from(matchPhotos).where(eq(matchPhotos.matchId, id)),
  ]);

  const eventPlayerIds = Array.from(
    new Set([...goalsRaw.map((g) => g.playerId), ...cardsRaw.map((c) => c.playerId)])
  );
  const eventTeamIds = Array.from(
    new Set([...goalsRaw.map((g) => g.teamId), ...cardsRaw.map((c) => c.teamId)])
  );
  const [evPlayers, evTeams] = await Promise.all([
    eventPlayerIds.length
      ? db
          .select()
          .from(players)
          .where(sql`${players.id} IN (${sql.join(eventPlayerIds.map((i) => sql`${i}`), sql`, `)})`)
      : Promise.resolve([] as (typeof players.$inferSelect)[]),
    eventTeamIds.length
      ? db
          .select()
          .from(teams)
          .where(sql`${teams.id} IN (${sql.join(eventTeamIds.map((i) => sql`${i}`), sql`, `)})`)
      : Promise.resolve([] as (typeof teams.$inferSelect)[]),
  ]);
  const playerMap = new Map(evPlayers.map((p) => [p.id, p]));
  const teamMap = new Map(evTeams.map((t) => [t.id, t]));

  const goals = goalsRaw.map((g) => ({
    ...g,
    player: playerMap.get(g.playerId)!,
    team: teamMap.get(g.teamId)!,
  }));
  const cards = cardsRaw.map((c) => ({
    ...c,
    player: playerMap.get(c.playerId)!,
    team: teamMap.get(c.teamId)!,
  }));

  const refereeIds = [m.centerRefereeId, m.linesman1Id, m.linesman2Id].filter(
    (x): x is number => x !== null
  );
  const refRows = refereeIds.length
    ? await db
        .select()
        .from(referees)
        .where(sql`${referees.id} IN (${sql.join(refereeIds.map((id) => sql`${id}`), sql`, `)})`)
    : [];
  const refMap = new Map(refRows.map((r) => [r.id, r]));

  const motm = m.motmPlayerId
    ? await db.query.players.findFirst({ where: eq(players.id, m.motmPlayerId) })
    : null;
  const motmTeam = motm
    ? await db.query.teams.findFirst({ where: eq(teams.id, motm.teamId) })
    : null;

  return {
    ...m,
    home,
    away,
    goals,
    cards,
    photos: photosRaw,
    centerReferee: m.centerRefereeId ? refMap.get(m.centerRefereeId) : null,
    linesman1: m.linesman1Id ? refMap.get(m.linesman1Id) : null,
    linesman2: m.linesman2Id ? refMap.get(m.linesman2Id) : null,
    motm: motm ? { ...motm, team: motmTeam } : null,
  };
}

export async function getTeamsAll() {
  return db.select().from(teams).orderBy(teams.name);
}

export async function getTeamDetail(id: number) {
  const team = await db.query.teams.findFirst({ where: eq(teams.id, id) });
  if (!team) return null;
  const teamPlayers = await db
    .select()
    .from(players)
    .where(eq(players.teamId, id))
    .orderBy(players.jerseyNumber);
  const all = await getMatches();
  const teamMatches = all.filter((m) => m.homeTeamId === id || m.awayTeamId === id);
  return { ...team, players: teamPlayers, matches: teamMatches };
}

export async function getTopScorers(limit = 10) {
  const rows = await db
    .select({
      playerId: goalEvents.playerId,
      teamId: goalEvents.teamId,
      goals: sql<number>`COUNT(*)`,
      minutes: sql<string>`STRING_AGG(${goalEvents.minute}::text, ',' ORDER BY ${goalEvents.minute})`,
    })
    .from(goalEvents)
    .groupBy(goalEvents.playerId, goalEvents.teamId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  if (!rows.length) return [];
  const playerIds = rows.map((r) => r.playerId);
  const teamIds = Array.from(new Set(rows.map((r) => r.teamId)));
  const [pRows, tRows] = await Promise.all([
    db.select().from(players).where(sql`${players.id} IN (${sql.join(playerIds.map((id) => sql`${id}`), sql`, `)})`),
    db.select().from(teams).where(sql`${teams.id} IN (${sql.join(teamIds.map((id) => sql`${id}`), sql`, `)})`),
  ]);
  const pMap = new Map(pRows.map((p) => [p.id, p]));
  const tMap = new Map(tRows.map((t) => [t.id, t]));

  return rows.map((r) => ({
    player: pMap.get(r.playerId)!,
    team: tMap.get(r.teamId)!,
    goals: Number(r.goals),
    minutes: (r.minutes ?? "").split(",").filter(Boolean).map(Number),
  }));
}

export async function getCardLeaders(limit = 10) {
  const rows = await db
    .select({
      playerId: cardEvents.playerId,
      teamId: cardEvents.teamId,
      yellow: sql<number>`SUM(CASE WHEN ${cardEvents.type} = 'YELLOW' THEN 1 ELSE 0 END)`,
      red: sql<number>`SUM(CASE WHEN ${cardEvents.type} = 'RED' THEN 1 ELSE 0 END)`,
      total: sql<number>`COUNT(*)`,
      points: sql<number>`SUM(CASE WHEN ${cardEvents.type} = 'RED' THEN 3 WHEN ${cardEvents.type} = 'YELLOW' THEN 1 ELSE 0 END)`,
    })
    .from(cardEvents)
    .groupBy(cardEvents.playerId, cardEvents.teamId)
    .orderBy(
      desc(sql`SUM(CASE WHEN ${cardEvents.type} = 'RED' THEN 3 WHEN ${cardEvents.type} = 'YELLOW' THEN 1 ELSE 0 END)`),
      desc(sql`SUM(CASE WHEN ${cardEvents.type} = 'RED' THEN 1 ELSE 0 END)`)
    )
    .limit(limit);

  if (!rows.length) return [];
  const playerIds = rows.map((r) => r.playerId);
  const teamIds = Array.from(new Set(rows.map((r) => r.teamId)));
  const [pRows, tRows] = await Promise.all([
    db.select().from(players).where(sql`${players.id} IN (${sql.join(playerIds.map((id) => sql`${id}`), sql`, `)})`),
    db.select().from(teams).where(sql`${teams.id} IN (${sql.join(teamIds.map((id) => sql`${id}`), sql`, `)})`),
  ]);
  const pMap = new Map(pRows.map((p) => [p.id, p]));
  const tMap = new Map(tRows.map((t) => [t.id, t]));

  return rows.map((r) => ({
    player: pMap.get(r.playerId)!,
    team: tMap.get(r.teamId)!,
    yellow: Number(r.yellow),
    red: Number(r.red),
    total: Number(r.total),
    points: Number(r.points),
  }));
}

export async function getMOTMList() {
  const finished = await db
    .select()
    .from(matches)
    .where(and(eq(matches.status, "FINISHED"), sql`${matches.motmPlayerId} IS NOT NULL`))
    .orderBy(desc(matches.kickoffAt));
  if (!finished.length) return [];

  const playerIds = finished.map((m) => m.motmPlayerId!).filter(Boolean);
  const pRows = await db
    .select()
    .from(players)
    .where(sql`${players.id} IN (${sql.join(playerIds.map((id) => sql`${id}`), sql`, `)})`);
  const teamIds = Array.from(new Set(pRows.map((p) => p.teamId)));
  const tRows = await db
    .select()
    .from(teams)
    .where(sql`${teams.id} IN (${sql.join(teamIds.map((id) => sql`${id}`), sql`, `)})`);
  const pMap = new Map(pRows.map((p) => [p.id, p]));
  const tMap = new Map(tRows.map((t) => [t.id, t]));

  return finished.map((m) => {
    const p = pMap.get(m.motmPlayerId!);
    return {
      matchId: m.id,
      kickoffAt: m.kickoffAt,
      player: p,
      team: p ? tMap.get(p.teamId) : null,
    };
  });
}

export async function getStandings() {
  const all = await db
    .select()
    .from(matches)
    .where(eq(matches.status, "FINISHED"));
  const allTeams = await db.select().from(teams);
  type Row = {
    teamId: number;
    name: string;
    origin: string;
    pld: number;
    w: number;
    d: number;
    l: number;
    gf: number;
    ga: number;
  };
  const map = new Map<number, Row>();
  for (const t of allTeams) {
    map.set(t.id, { teamId: t.id, name: t.name, origin: t.origin, pld: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 });
  }
  for (const m of all) {
    if (m.homeScore == null || m.awayScore == null) continue;
    if (m.homeTeamId == null || m.awayTeamId == null) continue;
    const h = map.get(m.homeTeamId);
    const a = map.get(m.awayTeamId);
    if (!h || !a) continue;
    h.pld++;
    a.pld++;
    h.gf += m.homeScore;
    h.ga += m.awayScore;
    a.gf += m.awayScore;
    a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) {
      h.w++;
      a.l++;
    } else if (m.homeScore < m.awayScore) {
      a.w++;
      h.l++;
    } else {
      h.d++;
      a.d++;
    }
  }
  return Array.from(map.values())
    .map((r) => ({ ...r, gd: r.gf - r.ga, pts: r.w * 3 + r.d }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
}

export async function getDashboardCounts() {
  const [t, p, m, finished, scheduled] = await Promise.all([
    db.select({ c: sql<number>`COUNT(*)` }).from(teams),
    db.select({ c: sql<number>`COUNT(*)` }).from(players),
    db.select({ c: sql<number>`COUNT(*)` }).from(matches),
    db.select({ c: sql<number>`COUNT(*)` }).from(matches).where(eq(matches.status, "FINISHED")),
    db.select({ c: sql<number>`COUNT(*)` }).from(matches).where(eq(matches.status, "SCHEDULED")),
  ]);
  return {
    teams: Number(t[0].c),
    players: Number(p[0].c),
    matches: Number(m[0].c),
    finished: Number(finished[0].c),
    scheduled: Number(scheduled[0].c),
  };
}


// ----- Player profile -----

export async function getPlayerProfile(id: number) {
  const player = await db.query.players.findFirst({ where: eq(players.id, id) });
  if (!player) return null;

  const team = await db.query.teams.findFirst({ where: eq(teams.id, player.teamId) });

  const [goals, cards, motmRows] = await Promise.all([
    db.select().from(goalEvents).where(eq(goalEvents.playerId, id)).orderBy(goalEvents.minute),
    db.select().from(cardEvents).where(eq(cardEvents.playerId, id)).orderBy(cardEvents.minute),
    db.select().from(matches).where(eq(matches.motmPlayerId, id)).orderBy(desc(matches.kickoffAt)),
  ]);

  // batch fetch matches for goal/card events
  const matchIds = Array.from(
    new Set([...goals.map((g) => g.matchId), ...cards.map((c) => c.matchId)])
  );
  const eventMatches = matchIds.length
    ? await db.select().from(matches).where(sql`${matches.id} IN (${sql.join(matchIds.map((i) => sql`${i}`), sql`, `)})`)
    : [];
  const matchMap = new Map(eventMatches.map((m) => [m.id, m]));

  return {
    ...player,
    team,
    goals: goals.map((g) => ({ ...g, match: matchMap.get(g.matchId) })),
    cards: cards.map((c) => ({ ...c, match: matchMap.get(c.matchId) })),
    motmCount: motmRows.length,
    motmMatches: motmRows,
  };
}
