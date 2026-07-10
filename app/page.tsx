"use client";

import { useState } from "react";
import heroesJson from "@/src/data/heroes.json";
import votesJson from "@/src/data/votes.json";
import type { HeroRole, HeroesData, TeamUpAbility, TeamUpSlot } from "@/src/types";

const heroData = heroesJson as HeroesData;
const initialVotes = votesJson as Record<string, number>;
const roles: HeroRole[] = ["Vanguard", "Duelist", "Strategist"];

const roleMeta: Record<HeroRole, { code: string; label: string; anchor: string }> = {
  Vanguard: { code: "V", label: "Front line", anchor: "vanguards" },
  Duelist: { code: "D", label: "Damage", anchor: "duelists" },
  Strategist: { code: "S", label: "Support", anchor: "strategists" },
};

export default function Home() {
  const [enhancedHeroes, setEnhancedHeroes] = useState<Record<string, boolean>>({});
  const [votes, setVotes] = useState<Record<string, number>>(initialVotes);
  const [heroVotes, setHeroVotes] = useState<Record<string, TeamUpSlot | undefined>>({});

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  function toggleEnhanced(heroId: string) {
    setEnhancedHeroes((current) => ({ ...current, [heroId]: !current[heroId] }));
  }

  function voteFor(heroId: string, abilities: [TeamUpAbility, TeamUpAbility], ability: TeamUpAbility) {
    const previousSlot = heroVotes[heroId];
    if (previousSlot === ability.slot) return;

    setVotes((current) => {
      const next = { ...current, [ability.id]: (current[ability.id] ?? 0) + 1 };
      if (previousSlot) {
        const previousAbility = abilities.find((item) => item.slot === previousSlot);
        if (previousAbility) next[previousAbility.id] = Math.max(0, (current[previousAbility.id] ?? 0) - 1);
      }
      return next;
    });
    setHeroVotes((current) => ({ ...current, [heroId]: ability.slot }));
  }

  return (
    <main className="app-shell" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Rivals Team-Ups home">
          <span className="brand-mark">R</span>
          <span><strong>RIVALS</strong><small>TEAM-UP MATRIX</small></span>
        </a>
        <nav className="role-nav" aria-label="Hero roles">
          <a href="#vanguards">Vanguards</a>
          <a href="#duelists">Duelists</a>
          <a href="#strategists">Strategists</a>
        </nav>
        <div className="header-stats" aria-label={`${totalVotes} community votes`}>
          <span>COMMUNITY VOTES</span>
          <strong>{totalVotes.toLocaleString()}</strong>
        </div>
      </header>

      <section className="hero-intro hero-intro-simple">
        <div>
          <p className="eyebrow">SEASON 09 · COMMUNITY DIRECTORY</p>
          <h1>Choose the better<br /><span>Team-Up.</span></h1>
          <p className="intro-copy">
            Compare both options for every hero, preview the anchor-enhanced effect,
            and vote for the Team-Up you would rather bring into the match.
          </p>
        </div>
        <div className="how-to-vote">
          <span>HOW IT WORKS</span>
          <ol>
            <li><b>01</b> Find your hero</li>
            <li><b>02</b> Toggle their anchor context</li>
            <li><b>03</b> Vote for Slot A or Slot B</li>
          </ol>
          <small>One active vote per hero. You can change your choice.</small>
        </div>
      </section>

      <section className="directory" aria-label="Hero Team-Up directory">
        {roles.map((role) => {
          const heroes = heroData.heroes.filter((hero) => hero.role === role);
          const meta = roleMeta[role];
          return (
            <section className={`role-section role-${role.toLowerCase()}`} id={meta.anchor} key={role}>
              <div className="role-banner">
                <span className="role-symbol">{meta.code}</span>
                <div><h2>{role} heroes</h2><p>{meta.label} · {heroes.length} operatives</p></div>
                <span className="role-count">0{heroData.heroes.indexOf(heroes[0]) + 1}—0{heroData.heroes.indexOf(heroes.at(-1)!) + 1}</span>
              </div>

              <div className="hero-panels">
                {heroes.map((hero) => {
                  const enhanced = Boolean(enhancedHeroes[hero.id]);
                  const heroTotal = hero.teamUpAbilities.reduce((sum, ability) => sum + (votes[ability.id] ?? 0), 0);
                  return (
                    <article className={`hero-panel ${enhanced ? "hero-enhanced" : ""}`} key={hero.id}>
                      <div className="hero-panel-header">
                        <span className="hero-avatar" aria-hidden="true">
                          {hero.name.split(" ").map((part) => part[0]).join("")}
                        </span>
                        <span className="hero-identity">
                          <strong>{hero.name}</strong>
                          <small>{heroTotal.toLocaleString()} TOTAL VOTES</small>
                        </span>
                        <button
                          className={`hero-toggle ${enhanced ? "is-on" : ""}`}
                          type="button"
                          role="switch"
                          aria-checked={enhanced}
                          aria-label={`Anchor Partner Present for ${hero.name}`}
                          onClick={() => toggleEnhanced(hero.id)}
                        >
                          <span className="hero-toggle-track"><span /></span>
                          <b>{enhanced ? "⚡ ENHANCED" : "ANCHOR OFF"}</b>
                        </button>
                      </div>

                      <div className="ability-divider"><span>CHOOSE THE BETTER TEAM-UP</span></div>

                      <div className="panel-abilities">
                        {hero.teamUpAbilities.map((ability) => {
                          const count = votes[ability.id] ?? 0;
                          const percentage = heroTotal ? Math.round((count / heroTotal) * 100) : 50;
                          const isVoted = heroVotes[hero.id] === ability.slot;
                          const isCommunityChoice = percentage >= 50;
                          return (
                            <article
                              className={`compact-ability ${isVoted ? "is-voted" : ""} ${enhanced ? "is-enhanced" : ""}`}
                              key={ability.id}
                            >
                              {isCommunityChoice && <span className="community-choice">◎ COMMUNITY CHOICE</span>}
                              <div className="compact-topline">
                                <span className="ability-glyph">{ability.slot}</span>
                                <span className="ability-name">{ability.name}</span>
                                <strong className="vote-percent">{percentage}%</strong>
                              </div>
                              <span className="anchor-chip">ANCHOR · {ability.anchorPartner}</span>
                              <p className="compact-description">
                                {enhanced ? ability.enhancedDescription : ability.baseDescription}
                              </p>
                              <button
                                className="vote-button"
                                type="button"
                                onClick={() => voteFor(hero.id, hero.teamUpAbilities, ability)}
                                aria-pressed={isVoted}
                              >
                                <span>{isVoted ? "YOUR VOTE" : `VOTE FOR SLOT ${ability.slot}`}</span>
                                <b>{isVoted ? "✓" : "+"}</b>
                              </button>
                            </article>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <footer>
        <span>RIVALS TEAM-UPS // COMMUNITY MATRIX</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
