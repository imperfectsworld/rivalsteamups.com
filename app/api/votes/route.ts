import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { teamUpVoteActivity, teamUpVotes } from "@/db/schema";
import heroesJson from "@/src/data/heroes.json";
import { RANKS, type HeroesData, type PlayerRank } from "@/src/types";

type VotePayload = {
  voterId?: string;
  heroId?: string;
  abilityId?: string;
  rank?: PlayerRank;
};

const CURRENT_SEASON = "Season 09";
const CURRENT_PATCH = "S9 Launch";
const heroData = heroesJson as HeroesData;

async function requestFingerprint(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const agent = request.headers.get("user-agent") || "unknown";
  const bytes = new TextEncoder().encode(`${ip}|${agent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).slice(0, 16).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

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

    const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
    if (!hero?.teamUpAbilities.some((ability) => ability.id === abilityId)) {
      return Response.json({ error: "That Team-Up does not belong to the selected hero." }, { status: 400 });
    }

    const db = getDb();
    const now = new Date();
    const minuteAgo = new Date(now.getTime() - 60_000);
    const twoSecondsAgo = new Date(now.getTime() - 2_000);
    const ipHash = await requestFingerprint(request);
    const [[voterRate], [ipRate], [rapidRepeat]] = await Promise.all([
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.voterId, voterId), gte(teamUpVoteActivity.createdAt, minuteAgo))),
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.ipHash, ipHash), gte(teamUpVoteActivity.createdAt, minuteAgo))),
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.voterId, voterId), eq(teamUpVoteActivity.heroId, heroId), gte(teamUpVoteActivity.createdAt, twoSecondsAgo))),
    ]);

    if (voterRate.total >= 12 || ipRate.total >= 40 || rapidRepeat.total > 0) {
      return Response.json(
        { error: "Voting is temporarily limited. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": rapidRepeat.total > 0 ? "2" : "60" } },
      );
    }

    await db
      .insert(teamUpVotes)
      .values({ voterId, heroId, abilityId, rank, season: CURRENT_SEASON, patch: CURRENT_PATCH })
      .onConflictDoUpdate({
        target: [teamUpVotes.voterId, teamUpVotes.heroId, teamUpVotes.rank, teamUpVotes.season, teamUpVotes.patch],
        set: { abilityId, updatedAt: new Date() },
      });

    await db.insert(teamUpVoteActivity).values({ voterId, ipHash, heroId });

    const [{ total }] = await db
      .select({ total: count() })
      .from(teamUpVotes)
      .where(and(eq(teamUpVotes.abilityId, abilityId), eq(teamUpVotes.season, CURRENT_SEASON), eq(teamUpVotes.patch, CURRENT_PATCH)));

    return Response.json({ ok: true, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vote";
    return Response.json({ error: message }, { status: 500 });
  }
}
