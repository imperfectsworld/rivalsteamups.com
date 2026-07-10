import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { teamUpVotes } from "@/db/schema";
import { RANKS, type PlayerRank } from "@/src/types";

type VotePayload = {
  voterId?: string;
  heroId?: string;
  abilityId?: string;
  rank?: PlayerRank;
};

export async function GET() {
  try {
    const rows = await getDb()
      .select({ abilityId: teamUpVotes.abilityId, rank: teamUpVotes.rank, total: count() })
      .from(teamUpVotes)
      .groupBy(teamUpVotes.abilityId, teamUpVotes.rank);

    return Response.json({ votes: rows });
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
      .values({ voterId, heroId, abilityId, rank })
      .onConflictDoUpdate({
        target: [teamUpVotes.voterId, teamUpVotes.heroId, teamUpVotes.rank],
        set: { abilityId, updatedAt: new Date() },
      });

    const [{ total }] = await getDb()
      .select({ total: count() })
      .from(teamUpVotes)
      .where(eq(teamUpVotes.abilityId, abilityId));

    return Response.json({ ok: true, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vote";
    return Response.json({ error: message }, { status: 500 });
  }
}
