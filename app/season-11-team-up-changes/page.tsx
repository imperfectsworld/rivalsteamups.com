import type { Metadata } from "next";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = {
  title: "Marvel Rivals Season 11 Team-Up Changes",
  description: "A complete, crawlable guide to Nightcrawler's Team-Ups and every Team-Up balance adjustment in Marvel Rivals Season 11.",
  alternates: { canonical: "/season-11-team-up-changes" },
  openGraph: {
    title: "Marvel Rivals Season 11 Team-Up Changes",
    description: "Nightcrawler's two new Team-Ups plus all 15 heroes with Team-Up balance changes for Season 11.",
    url: "/season-11-team-up-changes",
    type: "article",
  },
};

const changedHeroes = [
  { id: "devil-dinosaur", name: "Devil Dinosaur", role: "Vanguard", summary: "The Punisher Team-Up was slowed down: Primal Punishment’s cooldown increased from 12 to 18 seconds." },
  { id: "doctor-strange", name: "Doctor Strange", role: "Vanguard", summary: "The Invisible Woman pairing now grants a smaller Shield of the Seraphim bonus, while Psionic Vortex no longer grants Bonus Health to allies and converts more damage into Bonus Health for Doctor Strange. The Hulk enhanced effect retains less Gamma Maelstrom energy." },
  { id: "emma-frost", name: "Emma Frost", role: "Vanguard", summary: "The Luna Snow Team-Up’s Iced Out Diamond shield value decreased from 350 to 300." },
  { id: "groot", name: "Groot", role: "Vanguard", summary: "Wild Wall now receives the Flora Colossus passive when the Mantis Team-Up is selected, matching Thornlash Wall." },
  { id: "rogue", name: "Rogue", role: "Vanguard", summary: "The Gambit Team-Up’s Mr. & Mrs. X cooldown was reduced from 30 to 15 seconds, while its kinetic explosion and ally healing were reduced." },
  { id: "black-cat", name: "Black Cat", role: "Duelist", summary: "The Black Panther Team-Up now grants more Bonus Health and substantially more Fortune from Feline Alliance hits." },
  { id: "black-widow", name: "Black Widow", role: "Duelist", summary: "Allied Agents now grants Black Widow Bonus Health equal to half the damage dealt during Focused state, capped at 75." },
  { id: "elsa-bloodstone", name: "Elsa Bloodstone", role: "Duelist", summary: "Prehistoric Trap’s enhanced effect loses its extra Smoky Snare charge. In exchange, the Devil Dinosaur pairing now reduces Smoky Snare’s cooldown from 15 to 12 seconds." },
  { id: "star-lord", name: "Star-Lord", role: "Duelist", summary: "Cosmic Soul’s cooldown was reduced from 30 to 25 seconds and its resurrection cooldown from 120 to 105 seconds. The official explanation names Adam Warlock, while the balance bullet names Human Torch; the site keeps the established Adam Warlock pairing until the publisher clarifies it." },
  { id: "adam-warlock", name: "Adam Warlock", role: "Strategist", summary: "The Storm Team-Up’s Soaring Surge speed boost increased from 67% to 100%. Its enhanced Soul Bond Damage Boost decreased from 12% to 8%." },
  { id: "cloak-and-dagger", name: "Cloak & Dagger", role: "Strategist", summary: "The Hood Team-Up now causes Twilight Veil and Void Veil to Launch back enemies struck along their path." },
  { id: "jubilee", name: "Jubilee", role: "Strategist", summary: "Vampiric Kin’s Lifesteal for Jubilee and nearby allies increased from 30% to 40% with the Blade Team-Up selected." },
  { id: "loki", name: "Loki", role: "Strategist", summary: "Destroyed illusions now advance the cooldowns of Doppelganger and Devious Exchange with Hela selected. The Mantis Team-Up no longer grants allies a Damage Boost inside Regeneration Domain." },
  { id: "luna-snow", name: "Luna Snow", role: "Strategist", summary: "Spirit Fox no longer Charms enemies; it now deals more damage to enemies and heals allies more. The Adam Warlock Team-Up also converts more linked-ally healing into self-healing." },
  { id: "ultron", name: "Ultron", role: "Strategist", summary: "The Peni Parker combination was recalibrated by reducing Imperative: Firewall’s ally Bonus Health and Movement Speed boost." },
] as const;

export default function Season11TeamUpChangesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Marvel Rivals Season 11 Team-Up Changes",
    description: "Nightcrawler's Team-Ups and every Season 11 Team-Up balance adjustment.",
    datePublished: "2026-11-11",
    dateModified: "2026-11-11",
    author: { "@type": "Person", name: "DeAngelo Robinson" },
    mainEntityOfPage: "https://rivalsteamups.com/season-11-team-up-changes",
  };

  return <main className="season-changes-page" id="top">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <header className="topbar detail-topbar">
      <Link className="brand" href="/"><span className="brand-mark">R</span><span><strong>RIVALS</strong><small>TEAM-UPS</small></span></Link>
      <Link className="detail-back" href="/">← BACK TO DIRECTORY</Link>
    </header>

    <article className="season-changes-document">
      <section className="season-changes-hero">
        <p className="eyebrow">REVIEWED NOVEMBER 11, 2026 · SEASON 11</p>
        <h1>Season 11<br/><span>Team-Up changes</span></h1>
        <p>Season 11 begins November 13 at 09:00 UTC. Nightcrawler joins the Strategist roster with two new Team-Ups, and 15 existing heroes receive Team-Up balance adjustments. This page records what changed and which directory descriptions were revised.</p>
        <div><Link href="/#strategists">FIND NIGHTCRAWLER →</Link><Link href="/patches">VIEW LIVE VOTE REPORT →</Link></div>
      </section>

      <section className="nightcrawler-launch" aria-labelledby="nightcrawler-title">
        <div className="nightcrawler-copy">
          <p className="eyebrow">NEW STRATEGIST · VOTING STARTS AT ZERO</p>
          <h2 id="nightcrawler-title">Nightcrawler</h2>
          <p>Nightcrawler’s results begin with a clean sample because both choices are new. Existing heroes keep the cumulative vote history collected across prior seasons.</p>
          <div className="nightcrawler-teamups">
            <article><small>ANCHOR · ROGUE</small><h3>Protective Siblings</h3><p>Vanish in a burst of Chronovium Power that damages enemies and heals allies, then return with a three-sword slam that applies Slow. With Rogue present, the recalled energy heals, damages, and Launches enemies toward Nightcrawler.</p></article>
            <article><small>ANCHOR · MAGIK</small><h3>Demon Disciple</h3><p>Every spatial warp creates a spell field that damages enemies and heals allies. With Magik present, each warp also forms demonic armor and grants Bonus Health.</p></article>
          </div>
          <Link className="nightcrawler-vote-link" href="/#hero-nightcrawler">COMPARE &amp; VOTE FOR NIGHTCRAWLER →</Link>
        </div>
        <img src="/portraits/nightcrawler.webp" alt="Nightcrawler in his Marvel Rivals Season 11 design" />
      </section>

      <section className="season-change-list" aria-labelledby="changed-heroes-title">
        <div className="season-change-heading"><div><p className="eyebrow">DIRECTORY AUDIT</p><h2 id="changed-heroes-title">15 updated heroes</h2></div><p>Heroes below carry a <strong>✦ S11 UPDATED</strong> marker in the directory. Copy was rewritten where the mechanic changed; number-only adjustments are marked without adding cooldown or damage clutter to the cards.</p></div>
        <div className="season-change-grid">
          {changedHeroes.map((hero) => <article key={hero.id}>
            <Link href={`/heroes/${hero.id}`}><img src={`/heroes/${hero.id}.webp`} alt="" /><span><small>{hero.role} · ✦ S11 UPDATED</small><h3>{hero.name}</h3></span></Link>
            <p>{hero.summary}</p>
            <Link className="change-details-link" href={`/heroes/${hero.id}`}>VIEW HERO DETAILS →</Link>
          </article>)}
        </div>
      </section>

      <section className="season-change-sources">
        <p className="eyebrow">PRIMARY SOURCES</p>
        <h2>How this page was reviewed</h2>
        <p>The directory was checked against the official Marvel Rivals Season 11 patch notes and balance post. Descriptions summarize gameplay effects instead of reproducing the publisher’s full text. Numerical changes remain here in the change log so the directory stays easy to scan.</p>
        <div><a href="https://www.marvelrivals.com/gameupdate/20261111/41548_1319332.html" target="_blank" rel="noreferrer">OFFICIAL SEASON 11 PATCH NOTES ↗</a><a href="https://www.marvelrivals.com/balancepost/20261110/41667_1319209.html" target="_blank" rel="noreferrer">OFFICIAL BALANCE POST ↗</a></div>
      </section>
    </article>

    <footer className="detail-legal-footer"><span>RIVALS TEAM-UPS // SEASON 11</span><nav className="legal-links"><Link href="/">DIRECTORY</Link><Link href="/patches">LIVE RESULTS</Link><Link href="/about">ABOUT &amp; METHODOLOGY</Link><Link href="/contact">CONTACT</Link></nav><a href="#top">BACK TO TOP ↑</a></footer>
  </main>;
}
