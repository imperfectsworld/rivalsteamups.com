"use client";

import { useState } from "react";
import heroesJson from "@/src/data/heroes.json";
import type { Hero, HeroRole, HeroesData, TeamUpAbility, TeamUpSlot } from "@/src/types";

const heroData = heroesJson as HeroesData;
const roles: HeroRole[] = ["Vanguard", "Duelist", "Strategist"];

const roleMeta: Record<HeroRole, { code: string; label: string; anchor: string }> = {
  Vanguard: { code: "V", label: "Front line", anchor: "vanguards" },
  Duelist: { code: "D", label: "Damage", anchor: "duelists" },
  Strategist: { code: "S", label: "Support", anchor: "strategists" },
};

type DraftSelection = {
  heroId: Hero["id"];
  heroName: Hero["name"];
  ability: TeamUpAbility;
};

type DraftSlots = Record<TeamUpSlot, DraftSelection | null>;
const emptyDraft: DraftSlots = { A: null, B: null };

export default function Home() {
  const [selectedHeroId, setSelectedHeroId] = useState(heroData.heroes[0].id);
  const [anchorPresent, setAnchorPresent] = useState(false);
  const [draftSlots, setDraftSlots] = useState<DraftSlots>(emptyDraft);

  const selectedCount = Number(Boolean(draftSlots.A)) + Number(Boolean(draftSlots.B));

  function toggleDraft(hero: Hero, ability: TeamUpAbility) {
    setSelectedHeroId(hero.id);
    setDraftSlots((current) => {
      const isAlreadySelected = current[ability.slot]?.ability.id === ability.id;
      return {
        ...current,
        [ability.slot]: isAlreadySelected
          ? null
          : { heroId: hero.id, heroName: hero.name, ability },
      };
    });
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
        <div className="header-stats" aria-label={`${selectedCount} of 2 draft slots filled`}>
          <span>ACTIVE DRAFT</span>
          <strong>{selectedCount}<i>/02</i></strong>
        </div>
      </header>

      <section className="hero-intro">
        <div>
          <p className="eyebrow">SEASON 09 · COMMUNITY DIRECTORY</p>
          <h1>Choose your<br /><span>Team-Up.</span></h1>
          <p className="intro-copy">
            Compare every hero&apos;s two Team-Up options at a glance. Equip one
            ability per slot, then preview the anchor-partner advantage.
          </p>
        </div>
        <div className="context-control">
          <div className="context-label">
            <span>GLOBAL CONTEXT</span>
            <strong>Anchor Partner Present on Team</strong>
            <small>Switches every ability to its enhanced effect.</small>
          </div>
          <button
            className={`toggle ${anchorPresent ? "is-on" : ""}`}
            type="button"
            role="switch"
            aria-checked={anchorPresent}
            aria-label="Anchor Partner Present on Team"
            onClick={() => setAnchorPresent((value) => !value)}
          >
            <span className="toggle-track"><span className="toggle-knob" /></span>
            <b>{anchorPresent ? "ONLINE" : "OFFLINE"}</b>
          </button>
        </div>
      </section>

      <section className="draft-section" aria-label="Active Team-Up draft">
        <div className="draft-title">
          <span>YOUR ACTIVE DRAFT</span>
          <strong>Two slots. Any two heroes.</strong>
        </div>
        <div className="draft-slots">
          {(["A", "B"] as TeamUpSlot[]).map((slot) => {
            const selection = draftSlots[slot];
            return (
              <div className={`draft-slot ${selection ? "is-filled" : ""} ${anchorPresent && selection ? "is-enhanced" : ""}`} key={slot}>
                <span className="slot-tag">SLOT {slot}</span>
                {selection ? (
                  <>
                    <button
                      className="clear-slot"
                      type="button"
                      onClick={() => setDraftSlots((current) => ({ ...current, [slot]: null }))}
                      aria-label={`Clear slot ${slot}`}
                    >×</button>
                    <div className="draft-glyph">{selection.heroName.split(" ").map((part) => part[0]).join("")}</div>
                    <div className="draft-copy">
                      <strong>{selection.ability.name}</strong>
                      <small>{selection.heroName} + {selection.ability.anchorPartner}</small>
                    </div>
                    {anchorPresent && <span className="mini-enhanced">⚡ ENHANCED</span>}
                  </>
                ) : (
                  <>
                    <div className="draft-glyph is-empty">+</div>
                    <div className="draft-copy"><strong>UNASSIGNED</strong><small>Select a Team-Up below</small></div>
                  </>
                )}
              </div>
            );
          })}
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
                  const isFocused = hero.id === selectedHeroId;
                  const equippedCount = Object.values(draftSlots).filter((selection) => selection?.heroId === hero.id).length;
                  return (
                    <article className={`hero-panel ${isFocused ? "is-focused" : ""}`} key={hero.id}>
                      <button
                        className="hero-panel-header"
                        type="button"
                        onClick={() => setSelectedHeroId(hero.id)}
                        aria-pressed={isFocused}
                      >
                        <span className="hero-avatar" aria-hidden="true">
                          {hero.name.split(" ").map((part) => part[0]).join("")}
                        </span>
                        <span className="hero-identity">
                          <strong>{hero.name}</strong>
                          <small>{isFocused ? "SELECTOR ACTIVE" : "OPEN SELECTOR"} <b>→</b></small>
                        </span>
                        {equippedCount > 0 && <span className="equipped-count">{equippedCount} EQUIPPED</span>}
                      </button>

                      <div className="ability-divider"><span>TEAM-UP ABILITIES</span></div>

                      <div className="panel-abilities">
                        {hero.teamUpAbilities.map((ability) => {
                          const isSelected = draftSlots[ability.slot]?.ability.id === ability.id;
                          return (
                            <button
                              className={`compact-ability ${isSelected ? "is-selected" : ""} ${anchorPresent && isSelected ? "is-enhanced" : ""}`}
                              type="button"
                              onClick={() => toggleDraft(hero, ability)}
                              aria-pressed={isSelected}
                              key={ability.id}
                            >
                              <span className="compact-topline">
                                <span className="ability-glyph">{ability.slot}</span>
                                <span className="ability-name">{ability.name}</span>
                                <span className="slot-choice">SLOT {ability.slot}</span>
                              </span>
                              <span className="anchor-chip">ANCHOR · {ability.anchorPartner}</span>
                              <span className="compact-description">
                                {anchorPresent ? ability.enhancedDescription : ability.baseDescription}
                              </span>
                              <span className="choice-footer">
                                <span>{anchorPresent && isSelected ? "⚡ ENHANCED" : isSelected ? "ACTIVE CHOICE" : "SELECT TEAM-UP"}</span>
                                <b>{isSelected ? "✓" : "+"}</b>
                              </span>
                            </button>
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
