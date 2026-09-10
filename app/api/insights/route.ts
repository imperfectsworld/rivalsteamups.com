import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "@/db";
import { heroInsights, insightReactions } from "@/db/schema";
import heroesJson from "@/src/data/heroes.json";
import { RANKS, type HeroesData, type PlayerRank } from "@/src/types";
import { getActiveEra, isDeviceBlocked } from "@/db/community-admin";

const heroData = heroesJson as HeroesData;
const CURRENT_PATCH = "S10 Launch";
const blockedTerms = ["fuck", "shit", "bitch", "cunt", "nigger", "faggot", "retard", "kys"];
let schemaReady: Promise<unknown> | null = null;

function ensureInsightSchema() {
  if (!schemaReady) {
    schemaReady = env.DB.batch([
      env.DB.prepare(`CREATE TABLE IF NOT EXISTS hero_insights (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, hero_id text NOT NULL, voter_id text NOT NULL, display_name text DEFAULT 'Anonymous' NOT NULL, rank text, patch text DEFAULT '${CURRENT_PATCH}' NOT NULL, body text NOT NULL, created_at integer NOT NULL)`),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS hero_insights_hero_time_idx ON hero_insights (hero_id, created_at)"),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS insight_reactions (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, insight_id integer NOT NULL, voter_id text NOT NULL, value integer DEFAULT 0 NOT NULL, flagged integer DEFAULT 0 NOT NULL, created_at integer NOT NULL)"),
      env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS insight_reactions_insight_voter_unique ON insight_reactions (insight_id, voter_id)"),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS insight_reactions_insight_idx ON insight_reactions (insight_id)"),
    ]).catch((error) => { schemaReady = null; throw error; });
  }
  return schemaReady;
}

function hasBlockedLanguage(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  return blockedTerms.some((term) => new RegExp(`(^|\\s)${term}(s|ed|ing)?($|\\s)`, "i").test(normalized));
}

function validHero(heroId: string) {
  return heroData.heroes.some((hero) => hero.id === heroId);
}

export async function GET(request: Request) {
  try {
    await ensureInsightSchema();
    const url = new URL(request.url);
    const heroId = url.searchParams.get("heroId")?.trim();
    if (!heroId || !validHero(heroId)) return Response.json({ error: "Valid hero required", insights: [] }, { status: 400 });
    const db = getDb();
    const comments = await db.select().from(heroInsights).where(eq(heroInsights.heroId, heroId)).orderBy(desc(heroInsights.createdAt)).limit(100);
    const ids = comments.map((comment) => comment.id);
    const reactions = ids.length ? await db.select().from(insightReactions).where(inArray(insightReactions.insightId, ids)) : [];
    const insights = comments.map((comment) => {
      const commentReactions = reactions.filter((reaction) => reaction.insightId === comment.id);
      const score = commentReactions.reduce((sum, reaction) => sum + reaction.value, 0);
      const flags = commentReactions.filter((reaction) => reaction.flagged).length;
      return { id: comment.id, displayName: comment.displayName, rank: comment.rank, patch: comment.patch, platform: comment.platform, body: comment.body, createdAt: comment.createdAt, score, flags };
    }).filter((comment) => comment.flags < 3).sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return Response.json({ insights });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load insights", insights: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureInsightSchema();
    const payload = await request.json() as { action?: string; heroId?: string; voterId?: string; displayName?: string; rank?: PlayerRank | ""; platform?: "PC" | "Console"; body?: string; insightId?: number; value?: number };
    const voterId = payload.voterId?.trim();
    if (!voterId) return Response.json({ error: "Device identity required" }, { status: 400 });
    const db = getDb();
    if (await isDeviceBlocked(voterId)) return Response.json({ error: "This device is not permitted to post or react." }, { status: 403 });

    if (payload.action === "comment") {
      const heroId = payload.heroId?.trim() || "";
      const body = payload.body?.trim() || "";
      const displayName = payload.displayName?.trim() || "Anonymous";
      if (!validHero(heroId) || body.length < 8 || body.length > 800 || displayName.length > 32) return Response.json({ error: "Use 8–800 characters and a name under 32 characters." }, { status: 400 });
      if (hasBlockedLanguage(body) || hasBlockedLanguage(displayName)) return Response.json({ error: "Please revise the language in your name or insight." }, { status: 400 });
      if (payload.rank && !RANKS.includes(payload.rank)) return Response.json({ error: "Invalid rank" }, { status: 400 });
      const [recent] = await db.select().from(heroInsights).where(and(eq(heroInsights.voterId, voterId), gte(heroInsights.createdAt, new Date(Date.now() - 60_000)))).limit(1);
      if (recent) return Response.json({ error: "Please wait one minute before posting another insight." }, { status: 429, headers: { "Retry-After": "60" } });
      const activeEra = await getActiveEra();
      await db.insert(heroInsights).values({ heroId, voterId, displayName, rank: payload.rank || null, patch: activeEra.patch, platform: payload.platform === "Console" ? "Console" : "PC", body });
      return Response.json({ ok: true });
    }

    if ((payload.action === "react" || payload.action === "flag") && Number.isInteger(payload.insightId)) {
      const insightId = Number(payload.insightId);
      const value = payload.action === "react" && (payload.value === 1 || payload.value === -1) ? payload.value : 0;
      await db.insert(insightReactions).values({ insightId, voterId, value, flagged: payload.action === "flag" }).onConflictDoUpdate({
        target: [insightReactions.insightId, insightReactions.voterId],
        set: payload.action === "flag" ? { flagged: true } : { value },
      });
      return Response.json({ ok: true });
    }
    return Response.json({ error: "Unsupported insight action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save insight" }, { status: 500 });
  }
}
