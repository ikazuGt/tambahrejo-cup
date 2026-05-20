import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const id = () => serial("id").primaryKey();

// Enums (Postgres-native)
export const refereeRoleEnum = pgEnum("referee_role", ["CENTER", "LINESMAN"]);
export const matchRoundEnum = pgEnum("match_round", ["R32", "R16", "QF", "SF", "FINAL"]);
export const matchStatusEnum = pgEnum("match_status", ["SCHEDULED", "LIVE", "FINISHED", "POSTPONED"]);
export const goalTypeEnum = pgEnum("goal_type", ["GOAL", "OWN_GOAL", "PENALTY"]);
export const cardTypeEnum = pgEnum("card_type", ["YELLOW", "RED"]);
export const matchSlotEnum = pgEnum("match_slot", ["HOME", "AWAY"]);

export const tournaments = pgTable("tournaments", {
  id: id(),
  name: varchar("name", { length: 191 }).notNull().default("TAMBAHREJO CUP BY ZAY.AGENCY"),
  season: varchar("season", { length: 32 }).notNull().default("2026"),
  logoUrl: varchar("logo_url", { length: 500 }),
});

export const teams = pgTable("teams", {
  id: id(),
  name: varchar("name", { length: 191 }).notNull(),
  origin: varchar("origin", { length: 191 }).notNull(),
  managerName: varchar("manager_name", { length: 191 }).notNull(),
  logoUrl: varchar("logo_url", { length: 500 }),
  teamPhotoUrl: varchar("team_photo_url", { length: 500 }),
});

export const players = pgTable(
  "players",
  {
    id: id(),
    teamId: integer("team_id").notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    jerseyNumber: integer("jersey_number").notNull(),
    position: varchar("position", { length: 32 }).notNull().default("MID"),
    photoUrl: varchar("photo_url", { length: 500 }),
  },
  (t) => ({
    teamIdx: index("players_team_idx").on(t.teamId),
    teamJerseyUniq: uniqueIndex("players_team_jersey_uniq").on(t.teamId, t.jerseyNumber),
  })
);

export const referees = pgTable("referees", {
  id: id(),
  name: varchar("name", { length: 191 }).notNull(),
  role: refereeRoleEnum("role").notNull().default("CENTER"),
  photoUrl: varchar("photo_url", { length: 500 }),
});

export const matches = pgTable(
  "matches",
  {
    id: id(),
    round: matchRoundEnum("round").notNull(),
    groupName: varchar("group_name", { length: 32 }),
    homeTeamId: integer("home_team_id"),
    awayTeamId: integer("away_team_id"),
    kickoffAt: timestamp("kickoff_at").notNull(),
    venue: varchar("venue", { length: 191 }).notNull().default("Lapangan Tambahrejo"),
    status: matchStatusEnum("status").notNull().default("SCHEDULED"),
    homeScore: integer("home_score"),
    awayScore: integer("away_score"),
    centerRefereeId: integer("center_referee_id"),
    linesman1Id: integer("linesman1_id"),
    linesman2Id: integer("linesman2_id"),
    motmPlayerId: integer("motm_player_id"),
    highlightVideoUrl: varchar("highlight_video_url", { length: 500 }),
    livestreamUrl: varchar("livestream_url", { length: 500 }),
    nextMatchId: integer("next_match_id"),
    nextMatchSlot: matchSlotEnum("next_match_slot"),
    bracketSlot: integer("bracket_slot"),
  },
  (t) => ({
    kickoffIdx: index("matches_kickoff_idx").on(t.kickoffAt),
    statusIdx: index("matches_status_idx").on(t.status),
    roundIdx: index("matches_round_idx").on(t.round),
  })
);

export const matchPhotos = pgTable(
  "match_photos",
  {
    id: id(),
    matchId: integer("match_id").notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    caption: varchar("caption", { length: 191 }),
  },
  (t) => ({
    matchIdx: index("match_photos_match_idx").on(t.matchId),
  })
);

export const goalEvents = pgTable(
  "goal_events",
  {
    id: id(),
    matchId: integer("match_id").notNull(),
    playerId: integer("player_id").notNull(),
    teamId: integer("team_id").notNull(),
    minute: integer("minute").notNull(),
    type: goalTypeEnum("type").notNull().default("GOAL"),
  },
  (t) => ({
    matchIdx: index("goal_match_idx").on(t.matchId),
    playerIdx: index("goal_player_idx").on(t.playerId),
  })
);

export const cardEvents = pgTable(
  "card_events",
  {
    id: id(),
    matchId: integer("match_id").notNull(),
    playerId: integer("player_id").notNull(),
    teamId: integer("team_id").notNull(),
    minute: integer("minute").notNull(),
    type: cardTypeEnum("type").notNull(),
  },
  (t) => ({
    matchIdx: index("card_match_idx").on(t.matchId),
    playerIdx: index("card_player_idx").on(t.playerId),
  })
);

export const adminUsers = pgTable("admin_users", {
  id: id(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 191 }).notNull(),
});

// ----- relations -----

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one }) => ({
  team: one(teams, { fields: [players.teamId], references: [teams.id] }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  homeTeam: one(teams, { fields: [matches.homeTeamId], references: [teams.id], relationName: "home" }),
  awayTeam: one(teams, { fields: [matches.awayTeamId], references: [teams.id], relationName: "away" }),
  centerReferee: one(referees, { fields: [matches.centerRefereeId], references: [referees.id], relationName: "center" }),
  linesman1: one(referees, { fields: [matches.linesman1Id], references: [referees.id], relationName: "ln1" }),
  linesman2: one(referees, { fields: [matches.linesman2Id], references: [referees.id], relationName: "ln2" }),
  motm: one(players, { fields: [matches.motmPlayerId], references: [players.id] }),
  goals: many(goalEvents),
  cards: many(cardEvents),
  photos: many(matchPhotos),
}));

export const goalEventsRelations = relations(goalEvents, ({ one }) => ({
  match: one(matches, { fields: [goalEvents.matchId], references: [matches.id] }),
  player: one(players, { fields: [goalEvents.playerId], references: [players.id] }),
  team: one(teams, { fields: [goalEvents.teamId], references: [teams.id] }),
}));

export const cardEventsRelations = relations(cardEvents, ({ one }) => ({
  match: one(matches, { fields: [cardEvents.matchId], references: [matches.id] }),
  player: one(players, { fields: [cardEvents.playerId], references: [players.id] }),
  team: one(teams, { fields: [cardEvents.teamId], references: [teams.id] }),
}));

export const matchPhotosRelations = relations(matchPhotos, ({ one }) => ({
  match: one(matches, { fields: [matchPhotos.matchId], references: [matches.id] }),
}));
