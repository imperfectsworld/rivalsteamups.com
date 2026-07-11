import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const teamUpVotes = sqliteTable(
  "team_up_votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    voterId: text("voter_id").notNull(),
    heroId: text("hero_id").notNull(),
    abilityId: text("ability_id").notNull(),
    rank: text("rank").notNull(),
    season: text("season").notNull().default("Season 09"),
    patch: text("patch").notNull().default("S9 Launch"),
    platform: text("platform").notNull().default("PC"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("team_up_votes_voter_hero_rank_era_platform_unique").on(table.voterId, table.heroId, table.rank, table.season, table.patch, table.platform),
  ],
);

export const teamUpVoteActivity = sqliteTable(
  "team_up_vote_activity",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    voterId: text("voter_id").notNull(),
    ipHash: text("ip_hash").notNull(),
    heroId: text("hero_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    index("vote_activity_voter_time_idx").on(table.voterId, table.createdAt),
    index("vote_activity_ip_time_idx").on(table.ipHash, table.createdAt),
  ],
);

export const heroInsights = sqliteTable(
  "hero_insights",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    heroId: text("hero_id").notNull(),
    voterId: text("voter_id").notNull(),
    displayName: text("display_name").notNull().default("Anonymous"),
    rank: text("rank"),
    patch: text("patch").notNull().default("S9 Launch"),
    platform: text("platform").notNull().default("PC"),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [index("hero_insights_hero_time_idx").on(table.heroId, table.createdAt)],
);

export const insightReactions = sqliteTable(
  "insight_reactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    insightId: integer("insight_id").notNull(),
    voterId: text("voter_id").notNull(),
    value: integer("value").notNull().default(0),
    flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("insight_reactions_insight_voter_unique").on(table.insightId, table.voterId),
    index("insight_reactions_insight_idx").on(table.insightId),
  ],
);

export const blockedDevices = sqliteTable(
  "blocked_devices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    voterId: text("voter_id").notNull(),
    reason: text("reason").notNull().default("Blocked by moderator"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("blocked_devices_voter_unique").on(table.voterId)],
);

export const metaEras = sqliteTable(
  "meta_eras",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    season: text("season").notNull(),
    patch: text("patch").notNull(),
    status: text("status").notNull().default("archived"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("meta_eras_season_patch_unique").on(table.season, table.patch)],
);
