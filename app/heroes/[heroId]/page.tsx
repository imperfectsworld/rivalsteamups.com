import { notFound } from "next/navigation";
import heroesJson from "@/src/data/heroes.json";
import type { HeroesData } from "@/src/types";
import HeroDetailClient from "./HeroDetailClient";

const heroData = heroesJson as HeroesData;

export function generateStaticParams() {
  return heroData.heroes.map((hero) => ({ heroId: hero.id }));
}

export default async function HeroDetailPage({ params }: { params: Promise<{ heroId: string }> }) {
  const { heroId } = await params;
  const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
  if (!hero) notFound();

  return <HeroDetailClient hero={hero} />;
}
