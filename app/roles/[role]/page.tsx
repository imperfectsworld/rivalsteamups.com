import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { HeroRole } from "@/src/types";
import { roleCopy } from "../../seo-directory";
import Home from "../../HomeClient";
import { getVoteRows, groupVoteRows } from "../../vote-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const roleMap: Record<string, HeroRole> = { vanguards: "Vanguard", duelists: "Duelist", strategists: "Strategist" };
export function generateStaticParams() { return Object.keys(roleMap).map((role) => ({ role })); }
export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> { const { role } = await params; const name = roleMap[role]; if (!name) return {}; const title = `Best Marvel Rivals ${name} Team-Ups | Season 10`; return { title, description: roleCopy[name], alternates: { canonical: `/roles/${role}`, languages: { en: `/roles/${role}`, es: `/es/roles/${role}` } } }; }
export default async function RolePage({ params }: { params: Promise<{ role: string }> }) { const { role } = await params; const name = roleMap[role]; if (!name) notFound(); const initialVotes = groupVoteRows(await getVoteRows()); return <Home roleFilter={name} initialVotes={initialVotes} />; }
