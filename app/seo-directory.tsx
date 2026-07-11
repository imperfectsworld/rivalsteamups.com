import type { Hero, HeroRole } from "@/src/types";

export function SeoDirectory({ eyebrow, title, intro, heroes }: { eyebrow: string; title: string; intro: string; heroes: Hero[] }) {
  return <main className="legal-shell seo-shell">
    <header className="topbar detail-topbar"><a className="brand" href="/"><span className="brand-mark">R</span><span><strong>RIVALS</strong><small>TEAM-UP META</small></span></a><a className="detail-back" href="/">← BACK TO DIRECTORY</a></header>
    <section className="seo-landing"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="seo-intro">{intro}</p><div className="seo-hero-grid">{heroes.map((hero) => <a href={`/heroes/${hero.id}`} key={hero.id}><img src={`/heroes/${hero.id}.webp`} alt=""/><div><span>{hero.role}</span><h2>{hero.name}</h2><p>{hero.teamUpAbilities[0].name} vs. {hero.teamUpAbilities[1].name}</p><strong>VIEW TEAM-UP RESULTS →</strong></div></a>)}</div></section>
  </main>;
}

export const roleCopy: Record<HeroRole, string> = {
  Vanguard: "Compare the best Team-Up choices for Marvel Rivals Vanguard heroes. Review anchor partners, enhanced effects, rank-specific preferences, and PC versus console community results.",
  Duelist: "Explore community-selected Team-Ups for Marvel Rivals Duelist heroes, with detailed ability comparisons, competitive-rank voting, enhanced effects, and platform-specific results.",
  Strategist: "Find the most popular Team-Ups for Marvel Rivals Strategist heroes. Compare support-focused abilities, anchor partners, Enhanced bonuses, and voting patterns across ranks and platforms.",
};
