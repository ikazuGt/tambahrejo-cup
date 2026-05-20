"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
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
import { auth } from "@/auth";
import { purgeCloudflarePaths } from "@/lib/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Tidak diizinkan.");
}

function revalidateAll(matchId?: number) {
  revalidatePath("/");
  revalidatePath("/jadwal");
  revalidatePath("/hasil");
  revalidatePath("/klasemen");
  revalidatePath("/bracket");
  revalidatePath("/tim");
  revalidatePath("/statistik");
  if (matchId) revalidatePath(`/pertandingan/${matchId}`);
  revalidatePath("/admin");
  void purgeCloudflarePaths(
    [
      "/",
      "/jadwal",
      "/hasil",
      "/klasemen",
      "/bracket",
      "/tim",
      "/statistik",
      matchId ? `/pertandingan/${matchId}` : null,
    ].filter((x): x is string => Boolean(x))
  );
}

// ----- TEAMS -----

const teamSchema = z.object({
  name: z.string().min(1).max(191),
  origin: z.string().min(1).max(191),
  managerName: z.string().min(1).max(191),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  teamPhotoUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function createTeam(_: unknown, formData: FormData) {
  await requireAdmin();
  const data = teamSchema.parse({
    name: formData.get("name"),
    origin: formData.get("origin"),
    managerName: formData.get("managerName"),
    logoUrl: formData.get("logoUrl"),
    teamPhotoUrl: formData.get("teamPhotoUrl"),
  });
  await db.insert(teams).values({
    name: data.name,
    origin: data.origin,
    managerName: data.managerName,
    logoUrl: data.logoUrl || null,
    teamPhotoUrl: data.teamPhotoUrl || null,
  });
  revalidateAll();
  return { ok: true };
}

export async function updateTeam(id: number, formData: FormData) {
  await requireAdmin();
  const data = teamSchema.parse({
    name: formData.get("name"),
    origin: formData.get("origin"),
    managerName: formData.get("managerName"),
    logoUrl: formData.get("logoUrl"),
    teamPhotoUrl: formData.get("teamPhotoUrl"),
  });
  await db
    .update(teams)
    .set({
      name: data.name,
      origin: data.origin,
      managerName: data.managerName,
      logoUrl: data.logoUrl || null,
      teamPhotoUrl: data.teamPhotoUrl || null,
    })
    .where(eq(teams.id, id));
  revalidateAll();
}

export async function deleteTeam(id: number) {
  await requireAdmin();
  await db.delete(players).where(eq(players.teamId, id));
  await db.delete(teams).where(eq(teams.id, id));
  revalidateAll();
}

// ----- PLAYERS -----

const playerSchema = z.object({
  name: z.string().min(1).max(191),
  jerseyNumber: z.coerce.number().int().min(1).max(99),
  position: z.string().min(1).max(32),
});

export async function createPlayer(teamId: number, formData: FormData) {
  await requireAdmin();
  const data = playerSchema.parse({
    name: formData.get("name"),
    jerseyNumber: formData.get("jerseyNumber"),
    position: formData.get("position"),
  });
  await db.insert(players).values({ teamId, ...data });
  revalidateAll();
}

export async function deletePlayer(id: number) {
  await requireAdmin();
  await db.delete(players).where(eq(players.id, id));
  revalidateAll();
}

// ----- REFEREES -----

const refereeSchema = z.object({
  name: z.string().min(1).max(191),
  role: z.enum(["CENTER", "LINESMAN"]),
});

export async function createReferee(_: unknown, formData: FormData) {
  await requireAdmin();
  const data = refereeSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
  });
  await db.insert(referees).values(data);
  revalidateAll();
}

export async function deleteReferee(id: number) {
  await requireAdmin();
  await db.delete(referees).where(eq(referees.id, id));
  revalidateAll();
}

// ----- MATCHES -----

const matchSchema = z.object({
  round: z.enum(["R32", "R16", "QF", "SF", "FINAL"]),
  groupName: z.string().max(32).optional().or(z.literal("")),
  homeTeamId: z.coerce.number().int(),
  awayTeamId: z.coerce.number().int(),
  kickoffAt: z.string().min(1),
  venue: z.string().min(1).max(191),
  centerRefereeId: z.coerce.number().int().optional(),
  linesman1Id: z.coerce.number().int().optional(),
  linesman2Id: z.coerce.number().int().optional(),
});

export async function createMatch(_: unknown, formData: FormData) {
  await requireAdmin();
  const data = matchSchema.parse({
    round: formData.get("round"),
    groupName: formData.get("groupName"),
    homeTeamId: formData.get("homeTeamId"),
    awayTeamId: formData.get("awayTeamId"),
    kickoffAt: formData.get("kickoffAt"),
    venue: formData.get("venue"),
    centerRefereeId: formData.get("centerRefereeId") || undefined,
    linesman1Id: formData.get("linesman1Id") || undefined,
    linesman2Id: formData.get("linesman2Id") || undefined,
  });
  if (data.homeTeamId === data.awayTeamId) {
    throw new Error("Tim tidak boleh sama.");
  }
  await db.insert(matches).values({
    round: data.round,
    groupName: data.groupName || null,
    homeTeamId: data.homeTeamId,
    awayTeamId: data.awayTeamId,
    kickoffAt: new Date(data.kickoffAt),
    venue: data.venue,
    centerRefereeId: data.centerRefereeId ?? null,
    linesman1Id: data.linesman1Id ?? null,
    linesman2Id: data.linesman2Id ?? null,
  });
  revalidateAll();
}

export async function updateMatchScore(matchId: number, formData: FormData) {
  await requireAdmin();
  const homeScore = formData.get("homeScore");
  const awayScore = formData.get("awayScore");
  const status = (formData.get("status") as string) || "FINISHED";
  const motmPlayerId = formData.get("motmPlayerId");
  const highlightVideoUrl = (formData.get("highlightVideoUrl") as string) || null;
  const livestreamUrl = (formData.get("livestreamUrl") as string) || null;

  const allowedStatus = ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED"] as const;
  if (!(allowedStatus as readonly string[]).includes(status)) {
    throw new Error("Status tidak valid.");
  }

  const newHome = homeScore !== null && homeScore !== "" ? Number(homeScore) : null;
  const newAway = awayScore !== null && awayScore !== "" ? Number(awayScore) : null;

  await db
    .update(matches)
    .set({
      homeScore: newHome,
      awayScore: newAway,
      status: status as (typeof allowedStatus)[number],
      motmPlayerId: motmPlayerId ? Number(motmPlayerId) : null,
      highlightVideoUrl,
      livestreamUrl,
    })
    .where(eq(matches.id, matchId));

  // Auto-advance: if FINISHED and has a winner, propagate to next match
  if (status === "FINISHED" && newHome != null && newAway != null && newHome !== newAway) {
    await propagateWinner(matchId);
  }

  revalidateAll(matchId);
}

async function propagateWinner(matchId: number) {
  const m = await db.query.matches.findFirst({ where: eq(matches.id, matchId) });
  if (!m || !m.nextMatchId || !m.nextMatchSlot) return;
  if (m.homeScore == null || m.awayScore == null) return;
  if (m.homeTeamId == null || m.awayTeamId == null) return;

  const winnerId = m.homeScore > m.awayScore ? m.homeTeamId : m.awayTeamId;
  const slotField = m.nextMatchSlot === "HOME" ? "homeTeamId" : "awayTeamId";

  await db
    .update(matches)
    .set({ [slotField]: winnerId })
    .where(eq(matches.id, m.nextMatchId));
}

export async function deleteMatch(id: number) {
  await requireAdmin();
  await db.delete(goalEvents).where(eq(goalEvents.matchId, id));
  await db.delete(cardEvents).where(eq(cardEvents.matchId, id));
  await db.delete(matches).where(eq(matches.id, id));
  revalidateAll(id);
  redirect("/admin/matches");
}

// ----- EVENTS -----

const goalEventSchema = z.object({
  playerId: z.coerce.number().int(),
  minute: z.coerce.number().int().min(1).max(130),
  type: z.enum(["GOAL", "OWN_GOAL", "PENALTY"]),
});

export async function addGoalEvent(matchId: number, formData: FormData) {
  await requireAdmin();
  const data = goalEventSchema.parse({
    playerId: formData.get("playerId"),
    minute: formData.get("minute"),
    type: formData.get("type"),
  });
  const player = await db.query.players.findFirst({
    where: eq(players.id, data.playerId),
  });
  if (!player) throw new Error("Pemain tidak ditemukan.");
  await db.insert(goalEvents).values({
    matchId,
    playerId: data.playerId,
    teamId: player.teamId,
    minute: data.minute,
    type: data.type,
  });
  revalidateAll(matchId);
}

export async function removeGoalEvent(id: number, matchId: number) {
  await requireAdmin();
  await db.delete(goalEvents).where(eq(goalEvents.id, id));
  revalidateAll(matchId);
}

const cardEventSchema = z.object({
  playerId: z.coerce.number().int(),
  minute: z.coerce.number().int().min(1).max(130),
  type: z.enum(["YELLOW", "RED"]),
});

export async function addCardEvent(matchId: number, formData: FormData) {
  await requireAdmin();
  const data = cardEventSchema.parse({
    playerId: formData.get("playerId"),
    minute: formData.get("minute"),
    type: formData.get("type"),
  });
  const player = await db.query.players.findFirst({
    where: eq(players.id, data.playerId),
  });
  if (!player) throw new Error("Pemain tidak ditemukan.");
  await db.insert(cardEvents).values({
    matchId,
    playerId: data.playerId,
    teamId: player.teamId,
    minute: data.minute,
    type: data.type,
  });
  revalidateAll(matchId);
}

export async function removeCardEvent(id: number, matchId: number) {
  await requireAdmin();
  await db.delete(cardEvents).where(eq(cardEvents.id, id));
  revalidateAll(matchId);
}


// ----- BRACKET GENERATION -----

/**
 * Generate placeholder matches for the entire knockout bracket.
 * Wires next_match_id and next_match_slot so winners auto-advance.
 *
 * Structure (16 teams):
 *   8 R16 matches (slots 1-8)  â†’ 4 QF matches (slots 1-4)
 *   4 QF matches              â†’ 2 SF matches (slots 1-2)
 *   2 SF matches              â†’ 1 FINAL
 *
 * Pairing rule: match (i, i+1) at round N feeds into match (floor(i/2)) at round N+1.
 *   home if i is even, away if i is odd.
 */
export async function generateBracket() {
  await requireAdmin();

  // wipe existing matches (also delete events)
  const existing = await db.select().from(matches);
  if (existing.length > 0) {
    await db.delete(goalEvents);
    await db.delete(cardEvents);
    await db
      .update(matches)
      .set({ nextMatchId: null })
      .where(sql`1=1`); // unwire so we can delete safely
    await db.delete(matches);
  }

  // Reverse-create: FINAL first, then SF (referencing FINAL), then QF (ref SF), then R16 (ref QF)
  const baseTime = new Date();
  baseTime.setHours(15, 0, 0, 0);
  baseTime.setDate(baseTime.getDate() + 14);

  // FINAL (1 match, no next)
  const finalRow = await db
    .insert(matches)
    .values({
      round: "FINAL",
      bracketSlot: 1,
      kickoffAt: new Date(baseTime),
      venue: "Lapangan Tambahrejo",
      status: "SCHEDULED",
    })
    .returning({ id: matches.id });
  const finalId = finalRow[0].id;

  // SF (2 matches â†’ FINAL)
  const sfDate = new Date(baseTime);
  sfDate.setDate(sfDate.getDate() - 7);
  const sfIds: number[] = [];
  for (let i = 0; i < 2; i++) {
    const r = await db
      .insert(matches)
      .values({
        round: "SF",
        bracketSlot: i + 1,
        kickoffAt: new Date(sfDate.getTime() + i * 2 * 3600 * 1000),
        venue: "Lapangan Tambahrejo",
        status: "SCHEDULED",
        nextMatchId: finalId,
        nextMatchSlot: i === 0 ? "HOME" : "AWAY",
      })
      .returning({ id: matches.id });
    sfIds.push(r[0].id);
  }

  // QF (4 matches â†’ SF)
  const qfDate = new Date(baseTime);
  qfDate.setDate(qfDate.getDate() - 10);
  const qfIds: number[] = [];
  for (let i = 0; i < 4; i++) {
    const r = await db
      .insert(matches)
      .values({
        round: "QF",
        bracketSlot: i + 1,
        kickoffAt: new Date(qfDate.getTime() + i * 2 * 3600 * 1000),
        venue: "Lapangan Tambahrejo",
        status: "SCHEDULED",
        nextMatchId: sfIds[Math.floor(i / 2)],
        nextMatchSlot: i % 2 === 0 ? "HOME" : "AWAY",
      })
      .returning({ id: matches.id });
    qfIds.push(r[0].id);
  }

  // R16 (8 matches â†’ QF)
  const r16Date = new Date(baseTime);
  r16Date.setDate(r16Date.getDate() - 14);
  const r16Ids: number[] = [];
  for (let i = 0; i < 8; i++) {
    const r = await db
      .insert(matches)
      .values({
        round: "R16",
        bracketSlot: i + 1,
        kickoffAt: new Date(r16Date.getTime() + i * 2 * 3600 * 1000),
        venue: "Lapangan Tambahrejo",
        status: "SCHEDULED",
        nextMatchId: qfIds[Math.floor(i / 2)],
        nextMatchSlot: i % 2 === 0 ? "HOME" : "AWAY",
      })
      .returning({ id: matches.id });
    r16Ids.push(r[0].id);
  }

  revalidateAll();
  return { ok: true, r16Ids, qfIds, sfIds, finalId };
}

/**
 * Quick-edit a single match: assign teams, score, status, kickoff, venue.
 * Used by the new admin bracket UI where panitia clicks a card to edit.
 */
export async function quickEditMatch(matchId: number, formData: FormData) {
  await requireAdmin();

  const homeTeamId = formData.get("homeTeamId");
  const awayTeamId = formData.get("awayTeamId");
  const homeScore = formData.get("homeScore");
  const awayScore = formData.get("awayScore");
  const status = (formData.get("status") as string) || "SCHEDULED";
  const kickoffAt = formData.get("kickoffAt") as string | null;
  const venue = (formData.get("venue") as string) || "Lapangan Tambahrejo";
  const centerRefereeId = formData.get("centerRefereeId");
  const linesman1Id = formData.get("linesman1Id");
  const linesman2Id = formData.get("linesman2Id");
  const livestreamUrl = (formData.get("livestreamUrl") as string) || null;

  const newHome = homeScore && homeScore !== "" ? Number(homeScore) : null;
  const newAway = awayScore && awayScore !== "" ? Number(awayScore) : null;

  await db
    .update(matches)
    .set({
      homeTeamId: homeTeamId && homeTeamId !== "" ? Number(homeTeamId) : null,
      awayTeamId: awayTeamId && awayTeamId !== "" ? Number(awayTeamId) : null,
      homeScore: newHome,
      awayScore: newAway,
      status: status as "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED",
      kickoffAt: kickoffAt ? new Date(kickoffAt) : new Date(),
      venue,
      centerRefereeId: centerRefereeId && centerRefereeId !== "" ? Number(centerRefereeId) : null,
      linesman1Id: linesman1Id && linesman1Id !== "" ? Number(linesman1Id) : null,
      linesman2Id: linesman2Id && linesman2Id !== "" ? Number(linesman2Id) : null,
      livestreamUrl,
    })
    .where(eq(matches.id, matchId));

  // Auto-advance winner if finished
  if (status === "FINISHED" && newHome != null && newAway != null && newHome !== newAway) {
    await propagateWinner(matchId);
  }

  revalidateAll(matchId);
}



// ----- MATCH PHOTOS -----

const photoSchema = z.object({
  url: z.string().min(1).max(500),
  caption: z.string().max(191).optional().or(z.literal("")),
});

export async function addMatchPhoto(matchId: number, formData: FormData) {
  await requireAdmin();
  const data = photoSchema.parse({
    url: formData.get("url"),
    caption: formData.get("caption"),
  });
  await db.insert(matchPhotos).values({
    matchId,
    url: data.url,
    caption: data.caption || null,
  });
  revalidateAll(matchId);
}

export async function deleteMatchPhoto(id: number, matchId: number) {
  await requireAdmin();
  await db.delete(matchPhotos).where(eq(matchPhotos.id, id));
  revalidateAll(matchId);
}

// ----- PLAYER UPDATE (photo, name, etc.) -----

const playerUpdateSchema = z.object({
  name: z.string().min(1).max(191),
  jerseyNumber: z.coerce.number().int().min(1).max(99),
  position: z.string().min(1).max(32),
  photoUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function updatePlayer(playerId: number, formData: FormData) {
  await requireAdmin();
  const data = playerUpdateSchema.parse({
    name: formData.get("name"),
    jerseyNumber: formData.get("jerseyNumber"),
    position: formData.get("position"),
    photoUrl: formData.get("photoUrl"),
  });
  await db
    .update(players)
    .set({
      name: data.name,
      jerseyNumber: data.jerseyNumber,
      position: data.position,
      photoUrl: data.photoUrl || null,
    })
    .where(eq(players.id, playerId));
  revalidateAll();
}

// ----- REFEREE UPDATE -----

const refereeUpdateSchema = z.object({
  name: z.string().min(1).max(191),
  role: z.enum(["CENTER", "LINESMAN"]),
  photoUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function updateReferee(refereeId: number, formData: FormData) {
  await requireAdmin();
  const data = refereeUpdateSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    photoUrl: formData.get("photoUrl"),
  });
  await db
    .update(referees)
    .set({
      name: data.name,
      role: data.role,
      photoUrl: data.photoUrl || null,
    })
    .where(eq(referees.id, refereeId));
  revalidateAll();
}
