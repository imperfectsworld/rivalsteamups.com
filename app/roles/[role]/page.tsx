import { notFound } from "next/navigation";
import type { Metadata } from "next";
import heroesJson from "@/src/data/heroes.json";
import type { HeroRole, HeroesData } from "@/src/types";
import { roleCopy, SeoDirectory } from "../../seo-directory";

const heroData = heroesJson as HeroesData;
const roleMap: Record<string, HeroRole> = { vanguards: "Vanguard", duelists: "Duelist", strategists: "Strategist" };
export function generateStaticParams() { return Object.keys(roleMap).map((role) => ({ role })); }
export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> { const { role } = await params; const name = roleMap[role]; if (!name) return {}; const title = `Best Marvel Rivals ${name} Team-Ups | Season 9`; return { title, description: roleCopy[name], alternates: { canonical: `/roles/${role}` } }; }
export default async function RolePage({ params }: { params: Promise<{ role: string }> }) { const { role } = await params; const name = roleMap[role]; if (!name) notFound(); return <SeoDirectory eyebrow="SEASON 09 ROLE DIRECTORY" title={`${name} Team-Ups`} intro={roleCopy[name]} heroes={heroData.heroes.filter((hero) => hero.role === name)} />; }
