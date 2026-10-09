import Home from "./HomeClient";
import { getVoteRows, groupVoteRows } from "./vote-data";
import heroesJson from "@/src/data/heroes.json";
import { RANKS, type HeroesData } from "@/src/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Page() {
  const initialVotes = groupVoteRows(await getVoteRows());
  const heroes = (heroesJson as HeroesData).heroes;
  const totalFor = (abilityId: string) => RANKS.reduce((total, rank) => total + (initialVotes[rank]?.[abilityId] ?? 0), 0);
  const resultsData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Marvel Rivals Season 10.5 Team-Up community vote results",
    description: "Live cumulative community vote totals for every Marvel Rivals Team-Up, collected by Rivals Team-Ups and separated by hero and ability.",
    url: "https://rivalsteamups.com/",
    dateModified: "2026-10-08",
    creator: { "@type": "Person", name: "DeAngelo Robinson" },
    measurementTechnique: "One community preference vote per hero and device in each 24-hour period.",
    variableMeasured: heroes.flatMap((hero) => hero.teamUpAbilities.map((ability) => ({
      "@type": "PropertyValue",
      name: `${hero.name} — ${ability.name}`,
      value: totalFor(ability.id),
      unitText: "community votes",
      url: `https://rivalsteamups.com/heroes/${hero.id}`,
    }))),
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(resultsData).replace(/</g, "\\u003c") }} />
    <Home initialVotes={initialVotes} />
  </>;
}
