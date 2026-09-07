import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { HeroRole } from "@/src/types";
import Home from "../../../HomeClient";
import { getVoteRows, groupVoteRows } from "../../../vote-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const roleMap: Record<string, HeroRole> = { vanguards: "Vanguard", duelists: "Duelist", strategists: "Strategist" };
const roleNames: Record<HeroRole, string> = { Vanguard: "Vanguardias", Duelist: "Duelistas", Strategist: "Estrategas" };
export function generateStaticParams() { return Object.keys(roleMap).map((role) => ({ role })); }
export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> { const { role } = await params; const name = roleMap[role]; if (!name) return {}; return { title: `Mejores Team-Ups de ${roleNames[name]} | Marvel Rivals`, description: `Compara, filtra y vota por los Team-Ups de los héroes ${roleNames[name].toLowerCase()} de Marvel Rivals.`, alternates: { canonical: `/es/roles/${role}`, languages: { en: `/roles/${role}`, es: `/es/roles/${role}` } } }; }
export default async function Page({ params }: { params: Promise<{ role: string }> }) { const { role } = await params; const name = roleMap[role]; if (!name) notFound(); const initialVotes = groupVoteRows(await getVoteRows()); return <Home roleFilter={name} locale="es" initialVotes={initialVotes} />; }
