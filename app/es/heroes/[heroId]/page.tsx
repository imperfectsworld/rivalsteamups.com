import { notFound } from "next/navigation";
import type { Metadata } from "next";
import heroesJson from "@/src/data/heroes.json";
import heroesEsJson from "@/src/data/heroes-es.json";
import type { HeroesData } from "@/src/types";
import HeroDetailClient from "../../../heroes/[heroId]/HeroDetailClient";
import { getVoteRows, groupVoteRows } from "../../../vote-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const heroes = (heroesJson as HeroesData).heroes;
const spanishNames = new Map((heroesEsJson as unknown as { heroes: Array<{ id: string; nameEs: string }> }).heroes.map((hero) => [hero.id, hero.nameEs]));
export function generateStaticParams() { return heroes.map((hero) => ({ heroId: hero.id })); }
export async function generateMetadata({ params }: { params: Promise<{ heroId: string }> }): Promise<Metadata> { const { heroId } = await params; const hero = heroes.find((item) => item.id === heroId); if (!hero) return {}; const name = spanishNames.get(hero.id) ?? hero.name; const title = `Mejores Team-Ups de ${name} | Marvel Rivals`; const description = `Compara los dos Team-Ups de ${name}, con votos por rango competitivo y plataforma.`; return { title, description, alternates: { canonical: `/es/heroes/${hero.id}`, languages: { en: `/heroes/${hero.id}`, es: `/es/heroes/${hero.id}` } } }; }
export default async function Page({ params }: { params: Promise<{ heroId: string }> }) { const { heroId } = await params; const hero = heroes.find((item) => item.id === heroId); if (!hero) notFound(); const initialVotes = groupVoteRows(await getVoteRows()); return <HeroDetailClient hero={hero} locale="es" initialVotes={initialVotes} />; }
