import type { MetadataRoute } from "next";
import heroesJson from "@/src/data/heroes.json";
import type { HeroesData } from "@/src/types";

const heroes = (heroesJson as HeroesData).heroes;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rivalsteamups.com";
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...heroes.map((hero) => ({ url: `${base}/heroes/${hero.id}`, changeFrequency: "daily" as const, priority: 0.9 })),
    ...["vanguards", "duelists", "strategists"].map((role) => ({ url: `${base}/roles/${role}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: `${base}/patches`, changeFrequency: "weekly", priority: 0.7 },
    ...["legal-notice", "privacy-policy", "terms-of-use", "cookie-policy"].map((page) => ({ url: `${base}/${page}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
