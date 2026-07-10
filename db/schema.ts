import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("team_up_votes_voter_hero_rank_era_unique").on(table.voterId, table.heroId, table.rank, table.season, table.patch),
  ],
);
