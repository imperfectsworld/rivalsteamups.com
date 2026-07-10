import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { teamUpVotes } from "@/db/schema";
import { RANKS, type PlayerRank } from "@/src/types";

type VotePayload = {
  voterId?: string;
  heroId?: string;
  abilityId?: string;
  rank?: PlayerRank;
};

const CURRENT_SEASON = "Season 09";
const CURRENT_PATCH = "S9 Launch";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const season = url.searchParams.get("season") || CURRENT_SEASON;
    const patch = url.searchParams.get("patch") || CURRENT_PATCH;
    const window = url.searchParams.get("window") || "all";
    const filters = [eq(teamUpVotes.season, season), eq(teamUpVotes.patch, patch)];
    if (window === "recent") filters.push(gte(teamUpVotes.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));

    const rows = await getDb()
      .select({ abilityId: teamUpVotes.abilityId, rank: teamUpVotes.rank, total: count() })
      .from(teamUpVotes)
      .where(and(...filters))
      .groupBy(teamUpVotes.abilityId, teamUpVotes.rank);

    return Response.json({ votes: rows, season, patch, window });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load votes";
    return Response.json({ error: message, votes: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as VotePayload;
    const voterId = payload.voterId?.trim();
    const heroId = payload.heroId?.trim();
    const abilityId = payload.abilityId?.trim();
    const rank = payload.rank;

    if (!voterId || !heroId || !abilityId || !rank || !RANKS.includes(rank)) {
      return Response.json({ error: "A valid hero, Team-Up, voter, and rank are required." }, { status: 400 });
    }

    await getDb()
      .insert(teamUpVotes)
      .values({ voterId, heroId, abilityId, rank, season: CURRENT_SEASON, patch: CURRENT_PATCH })
      .onConflictDoUpdate({
        target: [teamUpVotes.voterId, teamUpVotes.heroId, teamUpVotes.rank, teamUpVotes.season, teamUpVotes.patch],
        set: { abilityId, updatedAt: new Date() },
      });

    const [{ total }] = await getDb()
      .select({ total: count() })
      .from(teamUpVotes)
      .where(and(eq(teamUpVotes.abilityId, abilityId), eq(teamUpVotes.season, CURRENT_SEASON), eq(teamUpVotes.patch, CURRENT_PATCH)));

    return Response.json({ ok: true, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vote";
    return Response.json({ error: message }, { status: 500 });
  }
}
