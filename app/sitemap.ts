import type { MetadataRoute } from "next";
import heroesJson from "@/src/data/heroes.json";
import type { HeroesData } from "@/src/types";

const heroes = (heroesJson as HeroesData).heroes;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rivalsteamups.com";
  const season10Updated = new Date("2026-09-10T00:00:00-04:00");
  return [
    { url: base, lastModified: season10Updated, changeFrequency: "daily", priority: 1 },
    { url: `${base}/es`, lastModified: season10Updated, changeFrequency: "daily", priority: 0.9 },
    ...heroes.map((hero) => ({ url: `${base}/heroes/${hero.id}`, lastModified: season10Updated, changeFrequency: "daily" as const, priority: 0.9 })),
    ...heroes.map((hero) => ({ url: `${base}/es/heroes/${hero.id}`, lastModified: season10Updated, changeFrequency: "daily" as const, priority: 0.8 })),
    ...["vanguards", "duelists", "strategists"].map((role) => ({ url: `${base}/roles/${role}`, lastModified: season10Updated, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["vanguards", "duelists", "strategists"].map((role) => ({ url: `${base}/es/roles/${role}`, lastModified: season10Updated, changeFrequency: "weekly" as const, priority: 0.7 })),
    { url: `${base}/patches`, lastModified: season10Updated, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/es/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/es/contact`, changeFrequency: "yearly", priority: 0.3 },
    ...["legal-notice", "privacy-policy", "terms-of-use", "cookie-policy"].map((page) => ({ url: `${base}/${page}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
