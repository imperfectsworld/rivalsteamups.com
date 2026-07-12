import { and, count, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { teamUpVoteActivity, teamUpVotes } from "@/db/schema";
import heroesJson from "@/src/data/heroes.json";
import { RANKS, type HeroesData, type PlayerRank } from "@/src/types";
import { getActiveEra, isDeviceBlocked } from "@/db/community-admin";

type VotePayload = {
  voterId?: string;
  heroId?: string;
  abilityId?: string;
  rank?: PlayerRank;
  platform?: "PC" | "Console";
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
    const platform = url.searchParams.get("platform") === "Console" ? "Console" : "PC";
    const filters = [eq(teamUpVotes.season, season), eq(teamUpVotes.patch, patch), eq(teamUpVotes.platform, platform)];
    if (window === "recent") filters.push(gte(teamUpVotes.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));

    const rows = await getDb()
      .select({ abilityId: teamUpVotes.abilityId, rank: teamUpVotes.rank, total: count() })
      .from(teamUpVotes)
      .where(and(...filters))
      .groupBy(teamUpVotes.abilityId, teamUpVotes.rank);

    return Response.json({ votes: rows, season, patch, window, platform });
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
    const platform = payload.platform === "Console" ? "Console" : "PC";

    if (!voterId || !heroId || !abilityId || !rank || !RANKS.includes(rank)) {
      return Response.json({ error: "A valid hero, Team-Up, voter, and rank are required." }, { status: 400 });
    }
    if (await isDeviceBlocked(voterId)) return Response.json({ error: "This device is not permitted to vote." }, { status: 403 });

    const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
    if (!hero?.teamUpAbilities.some((ability) => ability.id === abilityId)) {
      return Response.json({ error: "That Team-Up does not belong to the selected hero." }, { status: 400 });
    }

    const db = getDb();
    const now = new Date();
    const minuteAgo = new Date(now.getTime() - 60_000);
    const twoSecondsAgo = new Date(now.getTime() - 2_000);
    const cooldownStartedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ipHash = await requestFingerprint(request);
    const [[voterRate], [ipRate], [rapidRepeat], [sameTeamUpVote]] = await Promise.all([
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.voterId, voterId), gte(teamUpVoteActivity.createdAt, minuteAgo))),
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.ipHash, ipHash), gte(teamUpVoteActivity.createdAt, minuteAgo))),
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.voterId, voterId), eq(teamUpVoteActivity.heroId, heroId), gte(teamUpVoteActivity.createdAt, twoSecondsAgo))),
      db.select({ total: count() }).from(teamUpVoteActivity).where(and(eq(teamUpVoteActivity.voterId, voterId), eq(teamUpVoteActivity.abilityId, abilityId), gte(teamUpVoteActivity.createdAt, cooldownStartedAt))),
    ]);

    if (sameTeamUpVote.total > 0) {
      return Response.json(
        { error: "You already voted for this Team-Up in the last 24 hours. Please try again after the cooldown ends." },
        { status: 429, headers: { "Retry-After": "86400" } },
      );
    }

    if (voterRate.total >= 12 || ipRate.total >= 40 || rapidRepeat.total > 0) {
      return Response.json(
        { error: "Voting is temporarily limited. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": rapidRepeat.total > 0 ? "2" : "60" } },
      );
    }

    const activeEra = await getActiveEra();
    await db
      .insert(teamUpVotes)
      .values({ voterId, heroId, abilityId, rank, season: activeEra.season, patch: activeEra.patch, platform })
      .onConflictDoUpdate({
        target: [teamUpVotes.voterId, teamUpVotes.heroId, teamUpVotes.rank, teamUpVotes.season, teamUpVotes.patch, teamUpVotes.platform],
        set: { abilityId, updatedAt: new Date() },
      });

    await db.insert(teamUpVoteActivity).values({ voterId, ipHash, heroId, abilityId });

    const [{ total }] = await db
      .select({ total: count() })
      .from(teamUpVotes)
      .where(and(eq(teamUpVotes.abilityId, abilityId), eq(teamUpVotes.season, activeEra.season), eq(teamUpVotes.patch, activeEra.patch), eq(teamUpVotes.platform, platform)));

    return Response.json({ ok: true, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save vote";
    return Response.json({ error: message }, { status: 500 });
  }
}
