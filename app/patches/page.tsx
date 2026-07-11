import type { Metadata } from "next";
import heroesJson from "@/src/data/heroes.json";
import type { HeroesData } from "@/src/types";
import { SeoDirectory } from "../seo-directory";
export const metadata: Metadata = { title: "Marvel Rivals Season 9 Team-Up Patch Results", description: "Track Marvel Rivals Team-Up community preferences across Season 9 patches, ranks, and platforms.", alternates: { canonical: "/patches" } };
export default function PatchesPage() { const heroes = (heroesJson as HeroesData).heroes; return <SeoDirectory eyebrow="PATCH & SEASON HISTORY" title="Season 9 Team-Up Meta" intro="Season 9 Launch results are preserved separately from earlier balance eras so community preferences are not mixed after updates. Open a hero to compare all-time and recent voting by rank and platform." heroes={heroes} />; }
