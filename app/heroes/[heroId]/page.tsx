import { notFound } from "next/navigation";
import type { Metadata } from "next";
import heroesJson from "@/src/data/heroes.json";
import type { HeroesData } from "@/src/types";
import HeroDetailClient from "./HeroDetailClient";
import { getVoteRows, groupVoteRows } from "../../vote-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const heroData = heroesJson as HeroesData;

export function generateStaticParams() {
  return heroData.heroes.map((hero) => ({ heroId: hero.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ heroId: string }> }): Promise<Metadata> {
  const { heroId } = await params;
  const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
  if (!hero) return {};
  const [first, second] = hero.teamUpAbilities;
  const title = `Best ${hero.name} Team-Ups | Marvel Rivals Season 10`;
  const description = `Compare ${hero.name}'s ${first.name} and ${second.name} Team-Ups, rank-by-rank community votes, enhanced effects, and PC versus console results.`;
  const canonical = `/heroes/${hero.id}`;
  return {
    title,
    description,
    alternates: { canonical, languages: { en: canonical, es: `/es/heroes/${hero.id}` } },
    openGraph: { title, description, url: canonical, type: "website", images: ["/og-rivalsteamups-v3.png"] },
    twitter: { card: "summary_large_image", title, description, images: ["/og-rivalsteamups-v3.png"] },
  };
}

export default async function HeroDetailPage({ params }: { params: Promise<{ heroId: string }> }) {
  const { heroId } = await params;
  const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
  if (!hero) notFound();
  const initialVotes = groupVoteRows(await getVoteRows());

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${hero.name} Marvel Rivals Team-Up community results`,
    description: `Community voting data comparing ${hero.teamUpAbilities[0].name} and ${hero.teamUpAbilities[1].name} for ${hero.name}.`,
    url: `https://rivalsteamups.com/heroes/${hero.id}`,
    creator: { "@type": "Organization", name: "Rivals Team-Up Meta", url: "https://rivalsteamups.com" },
    isAccessibleForFree: true,
    keywords: ["Marvel Rivals", hero.name, hero.role, "Team-Up abilities", "community voting"],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <HeroDetailClient hero={hero} initialVotes={initialVotes} />
  </>;
}
