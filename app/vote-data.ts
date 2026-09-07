import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { teamUpVotes } from "@/db/schema";

export type VoteRow = { abilityId: string; rank: string; total: number };
export type GroupedVotes = Record<string, Record<string, number>>;

export async function getVoteRows({
  season = "Season 09",
  patch = "S9 Launch",
  window = "all",
  platform = "PC",
}: {
  season?: string;
  patch?: string;
  window?: "all" | "recent";
  platform?: "PC" | "Console";
} = {}): Promise<VoteRow[]> {
  try {
    const filters = [
      eq(teamUpVotes.season, season),
      eq(teamUpVotes.patch, patch),
      eq(teamUpVotes.platform, platform),
    ];
    if (window === "recent") {
      filters.push(gte(teamUpVotes.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
    }
    return await getDb()
      .select({ abilityId: teamUpVotes.abilityId, rank: teamUpVotes.rank, total: count() })
      .from(teamUpVotes)
      .where(and(...filters))
      .groupBy(teamUpVotes.abilityId, teamUpVotes.rank);
  } catch {
    // Local builds and previews may not have the production D1 binding.
    return [];
  }
}

export function groupVoteRows(rows: VoteRow[]): GroupedVotes {
  const grouped: GroupedVotes = {};
  for (const vote of rows) {
    grouped[vote.rank] ??= {};
    grouped[vote.rank][vote.abilityId] = vote.total;
  }
  return grouped;
}
