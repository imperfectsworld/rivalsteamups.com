"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import heroesJson from "@/src/data/heroes.json";
import rankVotesJson from "@/src/data/rankVotes.json";
import { RANKS, type Hero, type HeroRole, type HeroesData, type PlayerRank, type TeamUpAbility, type TeamUpSlot } from "@/src/types";

const heroData = heroesJson as HeroesData;
const seededRankVotes = rankVotesJson as Record<string, Record<TeamUpSlot, number[]>>;
const roles: HeroRole[] = ["Vanguard", "Duelist", "Strategist"];
const rankFilters = ["All Ranks", ...RANKS] as const;
type RankFilter = (typeof rankFilters)[number];
type LiveVotes = Record<string, Record<string, number>>;
const resultEras = [
  { id: "s9-launch", season: "Season 09", patch: "S9 Launch", label: "S9 · Launch" },
  { id: "s8-final", season: "Season 08", patch: "Final Balance", label: "S8 · Final" },
] as const;
type ResultEra = (typeof resultEras)[number];
type ResultWindow = "all" | "recent";

const rankImages: Record<PlayerRank, string> = {
  Bronze: "/ranks/bronze.webp",
  Silver: "/ranks/silver.webp",
  Gold: "/ranks/gold.webp",
  Platinum: "/ranks/platinum.webp",
  Diamond: "/ranks/diamond.webp",
  Grandmaster: "/ranks/grandmaster.webp",
  Celestial: "/ranks/celestial.webp",
  Eternity: "/ranks/eternity.webp",
  "One Above All": "/ranks/one-above-all.webp",
};

const rankColors: Record<RankFilter, string> = {
  "All Ranks": "#b8f34a",
  Bronze: "#c98b61",
  Silver: "#b8d5df",
  Gold: "#f2b431",
  Platinum: "#43e7df",
  Diamond: "#77adf3",
  Grandmaster: "#7b42ff",
  Celestial: "#ff7a1f",
  Eternity: "#f022ff",
  "One Above All": "#ff3023",
};

const roleMeta: Record<HeroRole, { code: string; label: string; anchor: string }> = {
  Vanguard: { code: "V", label: "Front line", anchor: "vanguards" },
  Duelist: { code: "D", label: "Damage", anchor: "duelists" },
  Strategist: { code: "S", label: "Support", anchor: "strategists" },
};

type PendingVote = { hero: Hero; ability: TeamUpAbility };
const heroImage = (heroId: string) => `/heroes/${heroId}.webp`;
const roleImage = (role: HeroRole) => `/roles/${role.toLowerCase()}.webp`;
const heroByName = new Map(heroData.heroes.map((hero) => [hero.name.toLowerCase(), hero]));
heroByName.set("deadpool", heroData.heroes.find((hero) => hero.id === "deadpool-duelist")!);
const anchorImage = (anchorPartner: string) => {
  const anchor = heroByName.get(anchorPartner.toLowerCase());
  return anchor ? heroImage(anchor.id) : "/heroes/hulk.webp";
};

export default function Home() {
  const [enhancedHeroes, setEnhancedHeroes] = useState<Record<string, boolean>>({});
  const [liveVotes, setLiveVotes] = useState<LiveVotes>({});
  const [selectedRank, setSelectedRank] = useState<RankFilter>("All Ranks");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingVote, setPendingVote] = useState<PendingVote | null>(null);
  const [voteRank, setVoteRank] = useState<PlayerRank | "">("");
  const [voteStatus, setVoteStatus] = useState("");
  const [selectedEra, setSelectedEra] = useState<ResultEra>(resultEras[0]);
  const [resultWindow, setResultWindow] = useState<ResultWindow>("all");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [collapsedRoles, setCollapsedRoles] = useState<Record<HeroRole, boolean>>({ Vanguard: false, Duelist: false, Strategist: false });

  const loadVotes = useCallback(async () => {
    try {
      const params = new URLSearchParams({ season: selectedEra.season, patch: selectedEra.patch, window: resultWindow });
      const response = await fetch(`/api/votes?${params}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { votes: Array<{ abilityId: string; rank: string; total: number }> };
      const grouped: LiveVotes = {};
      for (const vote of data.votes) {
        grouped[vote.rank] ??= {};
        grouped[vote.rank][vote.abilityId] = vote.total;
      }
      setLiveVotes(grouped);
    } catch {
      // The seeded rank matrix remains available during local previews without D1.
    }
  }, [selectedEra, resultWindow]);

  useEffect(() => { void loadVotes(); }, [loadVotes]);

  useEffect(() => {
    let previousY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setShowMobileSearch(currentY > 320 && currentY < previousY - 2);
      previousY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return heroData.heroes.filter((hero) => !normalized || hero.name.toLowerCase().includes(normalized));
  }, [query]);

  function seededCount(heroId: string, slot: TeamUpSlot, filter: RankFilter) {
    const configuredValues = seededRankVotes[heroId]?.[slot];
    const heroSeed = [...heroId].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const values = configuredValues ?? RANKS.map((_, rankIndex) =>
      8 + ((heroSeed + rankIndex * 7 + (slot === "A" ? 11 : 23)) % 24),
    );
    if (filter === "All Ranks") return values.reduce((sum, value) => sum + value, 0);
    return values[RANKS.indexOf(filter)] ?? 0;
  }

  function liveCount(abilityId: string, filter: RankFilter) {
    if (filter !== "All Ranks") return liveVotes[filter]?.[abilityId] ?? 0;
    return RANKS.reduce((sum, rank) => sum + (liveVotes[rank]?.[abilityId] ?? 0), 0);
  }

  function abilityCount(hero: Hero, ability: TeamUpAbility) {
    const seed = selectedEra.id === "s9-launch" && resultWindow === "all" ? seededCount(hero.id, ability.slot, selectedRank) : 0;
    return seed + liveCount(ability.id, selectedRank);
  }

  function chooseSuggestion(hero: Hero) {
    setQuery(hero.name);
    setSearchOpen(false);
    document.getElementById(`hero-${hero.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function openVote(hero: Hero, ability: TeamUpAbility) {
    setPendingVote({ hero, ability });
    setVoteStatus("");
    setVoteRank(selectedRank === "All Ranks" ? "" : selectedRank);
  }

  async function submitVote() {
    if (!pendingVote || !voteRank) {
      setVoteStatus("Choose your competitive rank to continue.");
      return;
    }

    let voterId = localStorage.getItem("rivals-voter-id");
    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("rivals-voter-id", voterId);
    }

    setVoteStatus("Saving vote…");
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId,
          heroId: pendingVote.hero.id,
          abilityId: pendingVote.ability.id,
          rank: voteRank,
        }),
      });
      if (!response.ok) throw new Error("Vote could not be saved");
      await loadVotes();
      setVoteStatus("Vote recorded. Thank you!");
      setTimeout(() => setPendingVote(null), 650);
    } catch {
      setVoteStatus("Voting needs the hosted database. The local preview cannot save this vote.");
    }
  }

  const visibleVoteTotal = heroData.heroes.reduce(
    (sum, hero) => sum + hero.teamUpAbilities.reduce((heroSum, ability) => heroSum + abilityCount(hero, ability), 0),
    0,
  );

  return (
    <main className="app-shell" id="top">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Rivals Team-Ups home">
          <span className="brand-mark">R</span>
          <span><strong>RIVALS</strong><small>TEAM-UP META</small></span>
        </a>
        <nav className="role-nav" aria-label="Hero roles">
          <a href="#vanguards">Vanguards</a><a href="#duelists">Duelists</a><a href="#strategists">Strategists</a>
        </nav>
        <div className="header-stats" style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties} aria-label={`${selectedRank}, ${visibleVoteTotal} visible votes`}>
          <img src={selectedRank === "All Ranks" ? "/rivals-icon.ico" : rankImages[selectedRank]} alt="" />
          <div><span>{selectedRank.toUpperCase()}</span><strong>{visibleVoteTotal.toLocaleString()}</strong></div>
        </div>
      </header>

      <a className={`mobile-top-arrow ${showMobileSearch ? "is-visible" : ""}`} href="#top" aria-label="Back to top">↑</a>

      <section className="hero-intro hero-intro-simple">
        <div>
          <p className="eyebrow">VOTE FOR YOUR FAVORITE TEAM-UP.</p>
          <h1>Find the better<br /><span>Team-Up.</span></h1>
          <p className="intro-copy">Search a hero, filter the community by competitive rank, and vote for the Team-Up you trust. Open any hero’s details page for ranked insights explaining why the community voted that way.</p>
        </div>
        <div className="how-to-vote rank-insight" style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties}>
          <img className="rank-insight-icon" src={selectedRank === "All Ranks" ? "/rivals-icon.ico" : rankImages[selectedRank]} alt="" />
          <div><span>LIVE RANK INSIGHT</span><strong>{selectedRank}</strong></div>
          <p>Showing {resultWindow === "recent" ? "the last 30 days" : "all-time results"} for {selectedEra.label}, from {selectedRank === "All Ranks" ? "the full ranked community" : `${selectedRank} players`}.</p>
        </div>
      </section>

      <section className="control-deck" style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties} aria-label="Directory controls">
        <div className="history-controls">
          <div><span>PATCH &amp; SEASON HISTORY</span>{resultEras.map((era) => <button className={selectedEra.id === era.id ? "is-active" : ""} type="button" onClick={() => setSelectedEra(era)} key={era.id}>{era.label}</button>)}</div>
          <div><span>RESULT WINDOW</span><button className={resultWindow === "all" ? "is-active" : ""} type="button" onClick={() => setResultWindow("all")}>ALL-TIME</button><button className={resultWindow === "recent" ? "is-active" : ""} type="button" onClick={() => setResultWindow("recent")}>LAST 30 DAYS</button></div>
        </div>
        <div className="hero-search">
          <label htmlFor="hero-search">SEARCH HERO</label>
          <div className="search-input-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              id="hero-search"
              type="search"
              value={query}
              placeholder="Search for a hero…"
              autoComplete="off"
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear hero search">×</button>}
          </div>
          {searchOpen && (
            <div className="search-suggestions">
              {suggestions.length ? suggestions.map((hero) => (
                <button type="button" onMouseDown={() => chooseSuggestion(hero)} key={hero.id}>
                  <span className="suggestion-avatar"><img src={heroImage(hero.id)} alt="" /></span>
                  <strong>{hero.name}</strong><small><img src={roleImage(hero.role)} alt="" />{hero.role}</small>
                </button>
              )) : <p>No heroes match “{query}”</p>}
            </div>
          )}
        </div>

        <div className="rank-filter">
          <div className="rank-filter-heading"><span>FILTER COMMUNITY BY RANK</span><strong>{selectedRank}</strong></div>
          <div className="rank-scale" role="group" aria-label="Community rank filter">
            {rankFilters.map((rank, index) => (
              <button className={selectedRank === rank ? "is-active" : ""} type="button" onClick={() => setSelectedRank(rank)} key={rank}>
                {rank === "All Ranks" ? <img className="all-ranks-icon" src="/rivals-icon.ico" alt="Marvel Rivals" /> : <img src={rankImages[rank]} alt="" />}
                <i>{index === 0 ? "00" : String(index).padStart(2, "0")}</i><span>{rank}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="directory" aria-label="Hero Team-Up directory">
        {roles.map((role) => {
          const heroes = heroData.heroes.filter((hero) => hero.role === role);
          const meta = roleMeta[role];
          return (
            <section className={`role-section role-${role.toLowerCase()}`} id={meta.anchor} key={role}>
              <button className="role-banner role-collapse-button" type="button" aria-expanded={!collapsedRoles[role]} onClick={() => setCollapsedRoles((current) => ({ ...current, [role]: !current[role] }))}>
                <span className="role-symbol"><img src={roleImage(role)} alt="" /></span>
                <div><h2>{role} heroes</h2><p>{meta.label} · {heroes.length} operatives</p></div>
                <span className="role-count">{collapsedRoles[role] ? "EXPAND +" : "COLLAPSE −"}</span>
              </button>
              {!collapsedRoles[role] && <div className="hero-panels">
                {heroes.map((hero) => {
                  const enhanced = Boolean(enhancedHeroes[hero.id]);
                  const counts = hero.teamUpAbilities.map((ability) => abilityCount(hero, ability));
                  const heroTotal = counts[0] + counts[1];
                  return (
                    <article className={`hero-panel ${enhanced ? "hero-enhanced" : ""}`} id={`hero-${hero.id}`} key={hero.id}>
                      <div className="hero-panel-header">
                        <a className="hero-profile-link" href={`/heroes/${hero.id}`} aria-label={`View ${hero.name} details`}>
                          <span className="hero-avatar" aria-hidden="true"><img src={heroImage(hero.id)} alt="" /></span>
                          <span className="hero-identity"><strong>{hero.name}</strong><small>{heroTotal.toLocaleString()} {selectedRank.toUpperCase()} VOTES</small><span className="hero-details-link">VIEW DETAILS →</span></span>
                        </a>
                        <button className={`hero-toggle ${enhanced ? "is-on" : ""}`} type="button" role="switch" aria-checked={enhanced} aria-label={`Enhanced descriptions for ${hero.name}`} onClick={() => setEnhancedHeroes((current) => ({ ...current, [hero.id]: !current[hero.id] }))}>
                          <span className="hero-toggle-track"><span /></span><b>{enhanced ? "⚡ ENHANCED ON" : "ENHANCED OFF"}</b>
                        </button>
                      </div>
                      <div className="ability-divider"><span>CHOOSE THE BETTER TEAM-UP</span></div>
                      <div className="panel-abilities">
                        {hero.teamUpAbilities.map((ability, abilityIndex) => {
                          const count = counts[abilityIndex];
                          const otherCount = counts[abilityIndex === 0 ? 1 : 0];
                          const percentage = heroTotal ? Math.round((count / heroTotal) * 100) : 50;
                          return (
                            <article
                              className={`compact-ability ${count > otherCount ? "is-community-choice" : ""} ${enhanced ? "is-enhanced" : ""}`}
                              key={ability.id}
                              role="button"
                              tabIndex={0}
                              aria-label={`Vote for ${ability.anchorPartner} Team-Up for ${hero.name}`}
                              onClick={() => openVote(hero, ability)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  openVote(hero, ability);
                                }
                              }}
                            >
                              {count > otherCount && <span className="community-choice">◎ COMMUNITY CHOICE</span>}
                              <div className="compact-topline"><span className="ability-glyph"><img src={anchorImage(ability.anchorPartner)} alt={`${ability.anchorPartner} portrait`} /></span><span className="ability-name">{ability.name}</span><strong className="vote-percent">{percentage}%</strong></div>
                              <span className="anchor-chip">ANCHOR · {ability.anchorPartner}</span>
                              <p className="compact-description">{enhanced ? ability.enhancedDescription : ability.baseDescription}</p>
                              <span className="card-vote-label"><span>VOTE FOR {ability.anchorPartner.toUpperCase()} TEAM-UP</span><b>+</b></span>
                            </article>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>}
            </section>
          );
        })}
      </section>

      <footer><span>RIVALS TEAM-UPS // RANKED COMMUNITY META</span><a href="#top">BACK TO TOP ↑</a></footer>

      {pendingVote && (
        <div className="vote-modal-backdrop" role="presentation" onMouseDown={() => setPendingVote(null)}>
          <section className="vote-modal" role="dialog" aria-modal="true" aria-labelledby="vote-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setPendingVote(null)} aria-label="Close vote dialog">×</button>
            <p className="eyebrow">ONE LAST STEP</p>
            <h2 id="vote-modal-title">What rank are you?</h2>
            <p>Your rank lets the community compare which Team-Ups different skill tiers prefer.</p>
            <div className="vote-summary"><span>{pendingVote.hero.name}</span><strong>{pendingVote.ability.name}</strong><small>{pendingVote.ability.anchorPartner} TEAM-UP</small></div>
            <div className="modal-ranks">
              {RANKS.map((rank, index) => <button className={voteRank === rank ? "is-active" : ""} type="button" onClick={() => { setVoteRank(rank); setVoteStatus(""); }} key={rank}><img src={rankImages[rank]} alt="" /><i>{String(index + 1).padStart(2, "0")}</i><span>{rank}</span></button>)}
            </div>
            {voteStatus && <p className="vote-status" aria-live="polite">{voteStatus}</p>}
            <button className="submit-vote" type="button" onClick={() => void submitVote()} disabled={!voteRank}>RECORD MY VOTE <b>→</b></button>
            <small className="privacy-note">Your vote uses a random device ID. No name or account is collected.</small>
          </section>
        </div>
      )}
    </main>
  );
}
