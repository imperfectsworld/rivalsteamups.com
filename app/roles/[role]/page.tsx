import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { HeroRole } from "@/src/types";
import { roleCopy } from "../../seo-directory";
import Home from "../../page";

const roleMap: Record<string, HeroRole> = { vanguards: "Vanguard", duelists: "Duelist", strategists: "Strategist" };
export function generateStaticParams() { return Object.keys(roleMap).map((role) => ({ role })); }
export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> { const { role } = await params; const name = roleMap[role]; if (!name) return {}; const title = `Best Marvel Rivals ${name} Team-Ups | Season 9`; return { title, description: roleCopy[name], alternates: { canonical: `/roles/${role}` } }; }
export default async function RolePage({ params }: { params: Promise<{ role: string }> }) { const { role } = await params; const name = roleMap[role]; if (!name) notFound(); return <Home roleFilter={name} />; }
