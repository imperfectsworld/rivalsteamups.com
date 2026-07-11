import { env } from "cloudflare:workers";
import { ensureCommunityAdminSchema } from "@/db/community-admin";

export async function GET() {
  await ensureCommunityAdminSchema();
  const result = await env.DB.prepare("SELECT id, season, patch, status FROM meta_eras ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, id DESC").all();
  return Response.json({ eras: result.results });
}
