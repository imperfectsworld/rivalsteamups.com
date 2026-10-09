import { notFound } from "next/navigation";
import type { Metadata } from "next";
import heroesJson from "@/src/data/heroes.json";
import heroGuidesJson from "@/src/data/hero-guides.json";
import type { HeroesData } from "@/src/types";
import HeroDetailClient from "./HeroDetailClient";
import { getVoteRows, groupVoteRows } from "../../vote-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const heroData = heroesJson as HeroesData;
const heroGuides = heroGuidesJson as { guides: Array<{ heroId: string; videoUrl: string; videoTitle?: string }> };

function cleanTitle(value: string) {
  return value.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '\"');
}

export function generateStaticParams() {
  return heroData.heroes.map((hero) => ({ heroId: hero.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ heroId: string }> }): Promise<Metadata> {
  const { heroId } = await params;
  const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
  if (!hero) return {};
  const [first, second] = hero.teamUpAbilities;
  const guide = heroGuides.guides.find((candidate) => candidate.heroId === hero.id);
  const videoTitle = guide?.videoTitle ? cleanTitle(guide.videoTitle) : `${hero.name} Team-Up Guide`;
  const title = `${videoTitle} | Season 10.5 Watch & Vote`;
  const description = `Watch the ${hero.name} Team-Up guide, compare ${first.name} and ${second.name}, then vote alongside the live Season 10.5 community results.`;
  const canonical = `/heroes/${hero.id}`;
  return {
    title,
    description,
    alternates: { canonical, languages: { en: canonical, es: `/es/heroes/${hero.id}` } },
    openGraph: { title, description, url: canonical, type: guide ? "video.other" : "website", images: [guide ? `https://i.ytimg.com/vi/${new URL(guide.videoUrl).searchParams.get("v")}/hqdefault.jpg` : "/og-rivalsteamups-v3.png"], ...(guide ? { videos: [{ url: guide.videoUrl }] } : {}) },
    twitter: { card: "summary_large_image", title, description, images: ["/og-rivalsteamups-v3.png"] },
  };
}

export default async function HeroDetailPage({ params }: { params: Promise<{ heroId: string }> }) {
  const { heroId } = await params;
  const hero = heroData.heroes.find((candidate) => candidate.id === heroId);
  if (!hero) notFound();
  const initialVotes = groupVoteRows(await getVoteRows());
  const voteTotal = (abilityId: string) => Object.values(initialVotes).reduce((total, rank) => total + (rank[abilityId] ?? 0), 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${hero.name} Marvel Rivals Team-Up community results`,
    description: `Community voting data comparing ${hero.teamUpAbilities[0].name} and ${hero.teamUpAbilities[1].name} for ${hero.name}.`,
    url: `https://rivalsteamups.com/heroes/${hero.id}`,
    creator: { "@type": "Organization", name: "Rivals Team-Up Meta", url: "https://rivalsteamups.com" },
    isAccessibleForFree: true,
    dateModified: "2026-10-08",
    measurementTechnique: "One community preference vote per hero and device in each 24-hour period.",
    variableMeasured: hero.teamUpAbilities.map((ability) => ({ "@type": "PropertyValue", name: ability.name, value: voteTotal(ability.id), unitText: "community votes" })),
    keywords: ["Marvel Rivals", hero.name, hero.role, "Team-Up abilities", "community voting"],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <HeroDetailClient hero={hero} initialVotes={initialVotes} />
  </>;
}
