import { env } from "cloudflare:workers";

let schemaReady: Promise<unknown> | null = null;

export function ensureCommunityAdminSchema() {
  if (!schemaReady) {
    schemaReady = env.DB.batch([
      env.DB.prepare("CREATE TABLE IF NOT EXISTS blocked_devices (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, voter_id text NOT NULL, reason text DEFAULT 'Blocked by moderator' NOT NULL, created_at integer NOT NULL)"),
      env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS blocked_devices_voter_unique ON blocked_devices (voter_id)"),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS meta_eras (id integer PRIMARY KEY AUTOINCREMENT NOT NULL, season text NOT NULL, patch text NOT NULL, status text DEFAULT 'archived' NOT NULL, created_at integer NOT NULL)"),
      env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS meta_eras_season_patch_unique ON meta_eras (season, patch)"),
      env.DB.prepare("INSERT OR IGNORE INTO meta_eras (season, patch, status, created_at) VALUES ('Season 10', 'S10 Launch', 'active', ?)").bind(Date.now()),
      env.DB.prepare("UPDATE meta_eras SET status = 'archived' WHERE season != 'Season 10' OR patch != 'S10 Launch'"),
      env.DB.prepare("UPDATE meta_eras SET status = 'active' WHERE season = 'Season 10' AND patch = 'S10 Launch'"),
    ]).catch((error) => { schemaReady = null; throw error; });
  }
  return schemaReady;
}

export async function isDeviceBlocked(voterId: string) {
  await ensureCommunityAdminSchema();
  return Boolean(await env.DB.prepare("SELECT id FROM blocked_devices WHERE voter_id = ? LIMIT 1").bind(voterId).first());
}

export async function getActiveEra() {
  await ensureCommunityAdminSchema();
  const row = await env.DB.prepare("SELECT season, patch FROM meta_eras WHERE status = 'active' ORDER BY id DESC LIMIT 1").first<{ season: string; patch: string }>();
  return row ?? { season: "Season 10", patch: "S10 Launch" };
}
