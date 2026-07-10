"use client";

import { useMemo, useState } from "react";
import heroesJson from "@/src/data/heroes.json";
import type { Hero, HeroRole, HeroesData, TeamUpAbility, TeamUpSlot } from "@/src/types";

const heroData = heroesJson as HeroesData;
const roles: HeroRole[] = ["Vanguard", "Duelist", "Strategist"];

const roleMeta: Record<HeroRole, { code: string; label: string }> = {
  Vanguard: { code: "V", label: "Front line" },
  Duelist: { code: "D", label: "Damage" },
  Strategist: { code: "S", label: "Support" },
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

  const selectedHero = useMemo(
    () => heroData.heroes.find((hero) => hero.id === selectedHeroId) ?? heroData.heroes[0],
    [selectedHeroId],
  );

  const selectedCount = Number(Boolean(draftSlots.A)) + Number(Boolean(draftSlots.B));

  function toggleDraft(hero: Hero, ability: TeamUpAbility) {
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
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Rivals Team-Ups home">
          <span className="brand-mark">R</span>
          <span>
            <strong>RIVALS</strong>
            <small>TEAM-UP MATRIX</small>
          </span>
        </a>
        <div className="season-pill">
          <span className="live-dot" />
          SEASON 09 <b>PROTOTYPE</b>
        </div>
        <div className="header-stats" aria-label={`${selectedCount} of 2 draft slots filled`}>
          <span>ACTIVE DRAFT</span>
          <strong>{selectedCount}<i>/02</i></strong>
        </div>
      </header>

      <section className="hero-intro" id="top">
        <div>
          <p className="eyebrow">COMMUNITY LOADOUT DIRECTORY</p>
          <h1>Build the link.<br /><span>Break the fight.</span></h1>
          <p className="intro-copy">
            Scout every hero&apos;s Team-Up options, lock two draft slots, and preview
            how an anchor partner changes the play.
          </p>
        </div>
        <div className="context-control">
          <div className="context-label">
            <span>CONTEXT MODIFIER</span>
            <strong>Anchor Partner Present on Team</strong>
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

      <section className="draft-bar" aria-label="Active Team-Up draft">
        <div className="section-index">01</div>
        <div className="draft-heading">
          <span>YOUR ACTIVE DRAFT</span>
          <strong>Choose one ability for each slot</strong>
        </div>
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
                  >
                    ×
                  </button>
                  <strong>{selection.ability.name}</strong>
                  <small>{selection.heroName} + {selection.ability.anchorPartner}</small>
                  {anchorPresent && <span className="mini-enhanced">⚡ ENHANCED</span>}
                </>
              ) : (
                <>
                  <strong>UNASSIGNED</strong>
                  <small>Select a card below</small>
                </>
              )}
            </div>
          );
        })}
      </section>

      <section className="matrix-section" aria-labelledby="roster-heading">
        <div className="section-title-row">
          <div className="section-index">02</div>
          <div>
            <p className="eyebrow">SELECT OPERATIVE</p>
            <h2 id="roster-heading">Hero roster</h2>
          </div>
          <p className="matrix-note">Select a hero to inspect their available Team-Up package.</p>
        </div>

        <div className="role-groups">
          {roles.map((role) => {
            const heroes = heroData.heroes.filter((hero) => hero.role === role);
            return (
              <div className={`role-group role-${role.toLowerCase()}`} key={role}>
                <div className="role-heading">
                  <span className="role-code">{roleMeta[role].code}</span>
                  <div><strong>{role}</strong><small>{roleMeta[role].label}</small></div>
                  <b>{String(heroes.length).padStart(2, "0")}</b>
                </div>
                <div className="hero-grid">
                  {heroes.map((hero) => {
                    const active = selectedHero.id === hero.id;
                    const drafted = Object.values(draftSlots).some((selection) => selection?.heroId === hero.id);
                    return (
                      <button
                        type="button"
                        className={`hero-card ${active ? "is-active" : ""}`}
                        onClick={() => setSelectedHeroId(hero.id)}
                        aria-pressed={active}
                        key={hero.id}
                      >
                        <span className="hero-number">{String(heroData.heroes.indexOf(hero) + 1).padStart(2, "0")}</span>
                        <span className="hero-monogram" aria-hidden="true">{hero.name.split(" ").map((part) => part[0]).join("")}</span>
                        <span className="hero-name">{hero.name}</span>
                        {drafted && <span className="drafted-dot" title="Included in draft" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="selector-panel" aria-live="polite">
        <div className="selector-identity">
          <span className={`identity-role role-${selectedHero.role.toLowerCase()}`}>{roleMeta[selectedHero.role].code}</span>
          <div>
            <p className="eyebrow">SPAWN ROOM SELECTOR</p>
            <h2>{selectedHero.name}</h2>
            <span>{selectedHero.role} · TWO AVAILABLE TEAM-UPS</span>
          </div>
          <div className="selector-monogram" aria-hidden="true">
            {selectedHero.name.split(" ").map((part) => part[0]).join("")}
          </div>
        </div>

        <div className="ability-grid">
          {selectedHero.teamUpAbilities.map((ability) => {
            const isSelected = draftSlots[ability.slot]?.ability.id === ability.id;
            return (
              <article
                className={`ability-card ${isSelected ? "is-selected" : ""} ${anchorPresent && isSelected ? "is-enhanced" : ""}`}
                key={ability.id}
              >
                <div className="ability-topline">
                  <span>SLOT {ability.slot}</span>
                  <span>{anchorPresent && isSelected ? "⚡ ENHANCED" : isSelected ? "ACTIVE" : "AVAILABLE"}</span>
                </div>
                <div className="ability-title-row">
                  <div className="ability-icon">{ability.slot}</div>
                  <div>
                    <h3>{ability.name}</h3>
                    <p>ANCHOR // {ability.anchorPartner}</p>
                  </div>
                </div>
                <p className="ability-description">
                  {anchorPresent ? ability.enhancedDescription : ability.baseDescription}
                </p>
                <button
                  type="button"
                  className="equip-button"
                  onClick={() => toggleDraft(selectedHero, ability)}
                >
                  <span>{isSelected ? "REMOVE FROM DRAFT" : `EQUIP TO SLOT ${ability.slot}`}</span>
                  <b>{isSelected ? "−" : "+"}</b>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <footer>
        <span>RIVALS TEAM-UPS // COMMUNITY MATRIX</span>
        <span>LOCAL PROTOTYPE DATA · SEASON 09</span>
      </footer>
    </main>
  );
}
