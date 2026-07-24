"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import heroesJson from "@/src/data/heroes.json";
import heroesEsJson from "@/src/data/heroes-es.json";
import { RANKS, type Hero, type HeroesData, type PlayerRank, type TeamUpAbility } from "@/src/types";
import { localePath, translate, type SiteLocale } from "@/src/i18n";

type LiveVotes = Record<string, Record<string, number>>;
type DetailRank = "All Ranks" | PlayerRank;
type Platform = "PC" | "Console";
type Insight = { id: number; displayName: string; rank: string | null; patch: string; platform: Platform; body: string; createdAt: string; score: number; flags: number };
const heroData = heroesJson as HeroesData;
type SpanishAbility = TeamUpAbility & { nameEs: string; anchorPartnerEs: string; baseDescriptionEs: string; enhancedDescriptionEs: string };
type SpanishHero = { id: string; nameEs: string; teamUpAbilities: SpanishAbility[] };
const spanishHeroes = (heroesEsJson as unknown as { heroes: SpanishHero[] }).heroes;
const spanishHeroNames = new Map(spanishHeroes.map((item) => [item.id, item.nameEs]));
const spanishAbilities = new Map(spanishHeroes.flatMap((item) => item.teamUpAbilities).map((ability) => [ability.id, ability]));
const heroByName = new Map(heroData.heroes.map((hero) => [hero.name.toLowerCase(), hero]));
heroByName.set("deadpool", heroData.heroes.find((candidate) => candidate.id === "deadpool-duelist")!);

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
const rankColors: Record<DetailRank, string> = {
  "All Ranks": "#43ddff", Bronze: "#c98b61", Silver: "#b8d5df", Gold: "#f2b431", Platinum: "#43e7df", Diamond: "#77adf3", Grandmaster: "#7b42ff", Celestial: "#ff7a1f", Eternity: "#f022ff", "One Above All": "#ff3023",
};
const enhancedPreferenceKey = "rivals-enhanced-heroes";
const insightNamePreferenceKey = "rivals-insight-display-name";

export default function HeroDetailClient({ hero, locale = "en" }: { hero: Hero; locale?: SiteLocale }) {
  const tx = (value: string) => translate(locale, value);
  const path = (value: string) => localePath(locale, value);
  const localizedHeroName = (item: Hero) => locale === "es" ? (spanishHeroNames.get(item.id) ?? item.name) : item.name;
  const localizedAbility = (ability: TeamUpAbility) => { const spanish = spanishAbilities.get(ability.id); return locale === "es" && spanish ? { ...ability, name: spanish.nameEs, anchorPartner: spanish.anchorPartnerEs, baseDescription: spanish.baseDescriptionEs, enhancedDescription: spanish.enhancedDescriptionEs } : ability; };
  const [liveVotes, setLiveVotes] = useState<LiveVotes>({});
  const [selectedRank, setSelectedRank] = useState<DetailRank>("All Ranks");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightName, setInsightName] = useState("");
  const [insightRank, setInsightRank] = useState<PlayerRank | "">("");
  const [insightBody, setInsightBody] = useState("");
  const [insightStatus, setInsightStatus] = useState("");
  const [enhanced, setEnhanced] = useState(false);
  const [platform, setPlatform] = useState<Platform>("PC");
  const [pendingAbility, setPendingAbility] = useState<TeamUpAbility | null>(null);
  const [voteRank, setVoteRank] = useState<PlayerRank | "">("");
  const [votePlatform, setVotePlatform] = useState<Platform | "">("");
  const [voteStatus, setVoteStatus] = useState("");
  const [voteCelebrating, setVoteCelebrating] = useState(false);
  const [showEnhancedDiscovery, setShowEnhancedDiscovery] = useState(false);

  const loadVotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/votes?platform=${platform}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { votes: Array<{ abilityId: string; rank: string; total: number }> };
      const grouped: LiveVotes = {};
      for (const vote of data.votes) {
        grouped[vote.rank] ??= {};
        grouped[vote.rank][vote.abilityId] = vote.total;
      }
      setLiveVotes(grouped);
    } catch {
      // Seeded data keeps the detail page useful in local previews.
    }
  }, [platform]);

  useEffect(() => { void loadVotes(); }, [loadVotes]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const linkedPlatform = params.get("platform");
    const linkedRank = params.get("rank");
    if (linkedPlatform === "PC" || linkedPlatform === "Console") setPlatform(linkedPlatform);
    else if (localStorage.getItem("rivals-platform") === "Console") setPlatform("Console");
    if (RANKS.includes(linkedRank as PlayerRank)) setInsightRank(linkedRank as PlayerRank);
    const savedInsightName = localStorage.getItem(insightNamePreferenceKey);
    if (savedInsightName) setInsightName(savedInsightName);
    try {
      const saved = JSON.parse(localStorage.getItem(enhancedPreferenceKey) || "{}") as Record<string, boolean>;
      setEnhanced(Boolean(saved[hero.id]));
    } catch {
      localStorage.removeItem(enhancedPreferenceKey);
    }
    setShowEnhancedDiscovery(true);
  }, []);

  function choosePlatform(next: Platform) {
    setPlatform(next);
    localStorage.setItem("rivals-platform", next);
  }

  function toggleEnhanced() {
    setEnhanced((current) => {
      const nextValue = !current;
      let saved: Record<string, boolean> = {};
      try { saved = JSON.parse(localStorage.getItem(enhancedPreferenceKey) || "{}"); } catch { /* Replace invalid storage. */ }
      localStorage.setItem(enhancedPreferenceKey, JSON.stringify({ ...saved, [hero.id]: nextValue }));
      return nextValue;
    });
    setShowEnhancedDiscovery(false);
  }

  const loadInsights = useCallback(async () => {
    try {
      const response = await fetch(`/api/insights?heroId=${encodeURIComponent(hero.id)}&platform=${platform}`, { cache: "no-store" });
      const data = await response.json() as { insights?: Insight[] };
      if (response.ok) setInsights(data.insights ?? []);
    } catch { setInsights([]); }
  }, [hero.id, platform]);

  useEffect(() => { void loadInsights(); }, [loadInsights]);

  function voterId() {
    let id = localStorage.getItem("rivals-voter-id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("rivals-voter-id", id); }
    return id;
  }

  function openVote(ability: TeamUpAbility) {
    const savedRank = localStorage.getItem("rivals-vote-rank");
    const savedPlatform = localStorage.getItem("rivals-platform");
    setPendingAbility(ability);
    setVoteStatus("");
    setVoteCelebrating(false);
    setVoteRank(selectedRank === "All Ranks" ? (RANKS.includes(savedRank as PlayerRank) ? savedRank as PlayerRank : "") : selectedRank);
    setVotePlatform(savedPlatform === "PC" || savedPlatform === "Console" ? savedPlatform : platform);
  }

  async function submitVote() {
    if (!pendingAbility || !voteRank || !votePlatform) {
      setVoteStatus("Choose your competitive rank and platform to continue.");
      return;
    }
    setVoteStatus("Saving vote...");
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: voterId(), heroId: hero.id, abilityId: pendingAbility.id, rank: voteRank, platform: votePlatform }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Vote could not be saved.");
      choosePlatform(votePlatform);
      localStorage.setItem("rivals-vote-rank", voteRank);
      const votedHeroes = JSON.parse(localStorage.getItem("rivals-voted-heroes") || "[]") as unknown;
      const next = Array.isArray(votedHeroes) ? [...new Set([...votedHeroes.filter((id): id is string => typeof id === "string"), hero.id])] : [hero.id];
      localStorage.setItem("rivals-voted-heroes", JSON.stringify(next));
      setVoteStatus("Vote counted!");
      setVoteCelebrating(true);
      await loadVotes();
      window.setTimeout(() => { setVoteCelebrating(false); setVoteStatus("Vote recorded. Thank you!"); }, 950);
    } catch (error) {
      setVoteStatus(error instanceof Error ? error.message : "Vote could not be saved. Please try again.");
    }
  }

  function continueToInsights() {
    setPendingAbility(null);
    setInsightRank(voteRank);
    window.setTimeout(() => document.getElementById("hero-insights")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  async function submitInsight() {
    setInsightStatus("Posting…");
    const response = await fetch("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", heroId: hero.id, voterId: voterId(), displayName: insightName, rank: insightRank, platform, body: insightBody }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setInsightStatus(data.error || "Unable to post insight."); return; }
    const savedName = insightName.trim();
    if (savedName) localStorage.setItem(insightNamePreferenceKey, savedName);
    setInsightBody(""); setInsightStatus("Insight posted."); await loadInsights();
  }

  async function reactToInsight(insightId: number, action: "react" | "flag", value = 0) {
    const response = await fetch("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, insightId, value, voterId: voterId() }) });
    if (response.ok) await loadInsights();
  }

  const rows = useMemo(() => RANKS.map((rank) => {
    const counts = hero.teamUpAbilities.map((ability) =>
      liveVotes[rank]?.[ability.id] ?? 0,
    ) as [number, number];
    const total = counts[0] + counts[1];
    return { rank, counts, total, percentages: counts.map((count) => total ? Math.round((count / total) * 100) : 50) as [number, number] };
  }), [hero, liveVotes, platform]);

  const selectedRow = selectedRank === "All Ranks" ? null : rows.find((row) => row.rank === selectedRank);
  const totals = (selectedRow?.counts ?? hero.teamUpAbilities.map((_, index) => rows.reduce((sum, row) => sum + row.counts[index], 0))) as [number, number];
  const totalVotes = totals[0] + totals[1];
  const leaderIndex = totals[1] > totals[0] ? 1 : 0;
  const leader = localizedAbility(hero.teamUpAbilities[leaderIndex]);
  const leaderPercent = totalVotes ? Math.round((totals[leaderIndex] / totalVotes) * 100) : 50;
  const rolePeers = heroData.heroes.filter((candidate) => candidate.role === hero.role && candidate.id !== hero.id);
  const roleAnchor = `${hero.role.toLowerCase()}s`;
  const featuredInsight = insights[0];

  return (
    <main className={`detail-shell detail-${hero.role.toLowerCase()}`} style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties}>
      <header className="topbar detail-topbar">
        <a className="brand" href={path("/")} aria-label="Rivals Team-Up Meta home">
          <span className="brand-mark">R</span>
          <span><strong>RIVALS</strong><small>TEAM-UP</small></span>
        </a>
        <a href={`${path("/")}#hero-${hero.id}`} className="detail-back">← {tx("BACK TO DIRECTORY")}</a>
        <a className="language-switch" href={locale === "es" ? `/heroes/${hero.id}` : `/es/heroes/${hero.id}`} hrefLang={locale === "es" ? "en" : "es"}>{locale === "es" ? "EN" : "ES"}</a>
      </header>

      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">{tx("SEASON 09 · HERO INTELLIGENCE")}</p>
          <div className="detail-role"><img src={`/roles/${hero.role.toLowerCase()}.webp`} alt="" />{hero.role}</div>
          <h1><img className="mobile-detail-hero-icon" src={`/heroes/${hero.id}.webp`} alt="" />{localizedHeroName(hero)}</h1>
          <p>{locale === "es" ? `Compara el Team-Up ${localizedAbility(hero.teamUpAbilities[0]).name} de ${localizedHeroName(hero)} con ${localizedAbility(hero.teamUpAbilities[1]).name}. Consulta las preferencias por rango y plataforma, los dos aliados ancla y todos los efectos mejorados de la Temporada 9.` : <>Compare {hero.name}&apos;s {hero.teamUpAbilities[0].name} Team-Up with {hero.teamUpAbilities[1].name}. Explore community preference by competitive rank and platform, review both anchor partners, and preview every Enhanced effect for Season 9.</>}</p>
          <div className="detail-summary-grid">
            <div><span>{tx("TOTAL VOTES")}</span><strong>{totalVotes.toLocaleString()}</strong></div>
            <div><span>{tx("COMMUNITY LEADER")}</span><strong>{leader.name}</strong><small>{leaderPercent}% {locale === "es" ? "de preferencia" : "preference"}</small></div>
            <div><span>{tx("LEAD MARGIN")}</span><strong>{Math.abs(totals[0] - totals[1]).toLocaleString()}</strong><small>{locale === "es" ? "votos de diferencia" : "votes between options"}</small></div>
          </div>
          <div className="detail-rank-selector" role="group" aria-label="Filter hero totals by rank">
            <button className={selectedRank === "All Ranks" ? "is-active" : ""} type="button" onClick={() => setSelectedRank("All Ranks")}><img src="/rivals-icon.ico" alt="" /><span>{tx("All")}</span></button>
            {RANKS.map((rank) => <button className={selectedRank === rank ? "is-active" : ""} type="button" onClick={() => setSelectedRank(rank)} key={rank}><img src={rankImages[rank]} alt="" /><span>{rank}</span></button>)}
          </div>
          {featuredInsight && <blockquote className="featured-insight">
            <p>“{featuredInsight.body}”</p>
            <footer>— {featuredInsight.displayName}, {featuredInsight.rank || "Unranked"} · {featuredInsight.patch}</footer>
            <a href="#hero-insights">VIEW MORE INSIGHTS ↓</a>
          </blockquote>}
        </div>
        <div className="detail-portrait"><img src={`/portraits/${hero.id}.webp`} alt={`${hero.name} full hero portrait`} /></div>
      </section>

      <section className="detail-content">
        <div className="platform-toggle detail-platform-toggle" role="group" aria-label="Gaming platform"><span>{tx("PLATFORM DATA")}</span><button className={platform === "PC" ? "is-active" : ""} type="button" onClick={() => choosePlatform("PC")}>PC</button><button className={platform === "Console" ? "is-active" : ""} type="button" onClick={() => choosePlatform("Console")}>{locale === "es" ? "CONSOLA" : "CONSOLE"}</button></div>
        <div className="detail-section-heading teamup-heading"><div><h2>{tx("Team-Up totals")}</h2></div><div className="detail-teamup-tools"><p>{locale === "es" ? `Mostrando ${selectedRank === "All Ranks" ? "todos los rangos" : selectedRank}.` : `Showing ${selectedRank === "All Ranks" ? "all ranks" : selectedRank}.`}</p><div className="enhanced-cue-wrap"><button className={`hero-toggle ${enhanced ? "is-on" : ""} ${showEnhancedDiscovery ? "is-discoverable" : ""}`} type="button" role="switch" aria-checked={enhanced} onClick={toggleEnhanced}><span className="hero-toggle-track"><span /></span><b>{enhanced ? `⚡ ${tx("ENHANCED ON")}` : tx("ENHANCED OFF")}</b></button>{showEnhancedDiscovery && <span className="enhanced-tap-cue">{locale === "es" ? "TOCA PARA VER EL BONUS" : "TAP TO PREVIEW"} <b>⚡</b></span>}</div></div></div>
        <div className="detail-teamups">
          {hero.teamUpAbilities.map((ability, index) => {
            const displayAbility = localizedAbility(ability);
            const anchor = heroByName.get(ability.anchorPartner.toLowerCase());
            const percentage = totalVotes ? Math.round((totals[index] / totalVotes) * 100) : 50;
            return <article className={`${index === leaderIndex ? "is-leader" : ""} ${enhanced ? "is-enhanced" : ""}`} key={ability.id}>
              {index === leaderIndex && <b className="detail-choice-badge">{tx("COMMUNITY CHOICE")}</b>}
              <div className="detail-anchor"><img className={enhanced ? "is-animated" : ""} src={anchor ? `/${enhanced ? "lord-icons" : "heroes"}/${anchor.id}.webp` : `/${enhanced ? "lord-icons" : "heroes"}/hulk.webp`} alt="" /><span><small>{locale === "es" ? "ANCLA" : "ANCHOR"}</small><strong>{displayAbility.anchorPartner}</strong></span><em>{percentage}%</em></div>
              <h3>{displayAbility.name}</h3><p>{displayAbility.baseDescription}</p>
              {enhanced && <p className="enhanced-addon"><strong>⚡ {locale === "es" ? "MEJORADO:" : "ENHANCED:"}</strong> {displayAbility.enhancedDescription}</p>}
              <footer><span>{totals[index].toLocaleString()} votes</span><strong>{percentage}% of community</strong></footer>
              <button className="detail-vote-button" type="button" onClick={() => openVote(ability)}>{tx("VOTE FOR")} {displayAbility.anchorPartner.toUpperCase()} TEAM-UP <b>+</b></button>
            </article>;
          })}
        </div>

        <aside className="role-discovery" aria-labelledby="role-discovery-title">
          <div className="role-discovery-heading">
            <div><span>EXPLORE THE ROSTER</span><h2 id="role-discovery-title">Discover other {hero.role} heroes</h2></div>
            <img src={`/roles/${hero.role.toLowerCase()}.webp`} alt="" />
          </div>
          <p>Compare Team-Up preferences and ranked community trends for other heroes in the {hero.role} role.</p>
          <div className="role-peer-list">
            {rolePeers.map((peer) => <a href={path(`/heroes/${peer.id}`)} key={peer.id} aria-label={`View ${peer.name} details`}>
              <img src={`/heroes/${peer.id}.webp`} alt="" />
              <span>{localizedHeroName(peer)}</span>
            </a>)}
          </div>
          <a className="role-discovery-all" href={`/#${roleAnchor}`}>VIEW ALL {hero.role.toUpperCase()} HEROES <b>›</b></a>
        </aside>

        <section className="insights-section" id="hero-insights">
          <div className="detail-section-heading"><div><h2>{tx("Community insights")}</h2></div><p>{locale === "es" ? "Contexto por rango de los jugadores detrás de los votos." : "Ranked context from players behind the votes."}</p></div>
          <div className="insight-composer">
            <div><label>DISPLAY NAME <input value={insightName} maxLength={32} placeholder="Anonymous" onChange={(event) => setInsightName(event.target.value)} /></label><label>YOUR RANK <select value={insightRank} onChange={(event) => setInsightRank(event.target.value as PlayerRank | "")}><option value="">Not selected</option>{RANKS.map((rank) => <option value={rank} key={rank}>{rank}</option>)}</select></label></div>
            <label>YOUR INSIGHT <textarea value={insightBody} maxLength={800} placeholder="Why do you prefer one Team-Up? Share useful matchup, composition, or rank-specific context…" onChange={(event) => setInsightBody(event.target.value)} /></label>
            <button type="button" disabled={insightBody.trim().length < 8} onClick={() => void submitInsight()}>POST INSIGHT →</button>
            {insightStatus && <p className="insight-status" aria-live="polite">{insightStatus}</p>}
          </div>
          <div className="insight-list">
            {insights.length ? insights.map((insight) => <article key={insight.id}>
              <header><strong>{insight.displayName}</strong><span>{insight.rank || "Unranked"} · {insight.platform} · {insight.patch}</span></header>
              <p>{insight.body}</p>
              <footer><button type="button" onClick={() => void reactToInsight(insight.id, "react", 1)}>▲ UPVOTE</button><b>{insight.score}</b><button type="button" onClick={() => void reactToInsight(insight.id, "react", -1)}>▼ DOWNVOTE</button><button className="flag-insight" type="button" onClick={() => void reactToInsight(insight.id, "flag")}>FLAG</button></footer>
            </article>) : <p className="empty-insights">No insights yet. Be the first to explain your vote.</p>}
          </div>
        </section>

        <div className="detail-section-heading"><div><h2>{tx("Detailed rank breakdown")}</h2></div><p>{locale === "es" ? "Observa cómo cambian las preferencias al subir de rango competitivo." : "See how preference changes as the competitive tier rises."}</p></div>
        <div className="rank-breakdown">
          {rows.map((row) => <article key={row.rank}>
            <div className="breakdown-rank"><img src={rankImages[row.rank]} alt="" /><span><strong>{row.rank}</strong><small>{row.total.toLocaleString()} votes</small></span></div>
            <div className="breakdown-bars">
              {hero.teamUpAbilities.map((ability, index) => <div key={ability.id}><span><b>{localizedAbility(ability).name} ({localizedAbility(ability).anchorPartner})</b><em>{row.counts[index]} · {row.percentages[index]}%</em></span><i><b style={{ width: `${row.percentages[index]}%` }} /></i></div>)}
            </div>
          </article>)}
        </div>

      </section>
      <footer className="detail-legal-footer"><span>RIVALS TEAM-UPS // {platform.toUpperCase()} COMMUNITY META</span><nav className="legal-links"><a href="/contact">CONTACT</a><a href="/legal-notice">LEGAL NOTICE</a><a href="/privacy-policy">PRIVACY</a><a href="/terms-of-use">TERMS</a><a href="/cookie-policy">COOKIES</a></nav><a href="/">DIRECTORY ↑</a></footer>
      {pendingAbility && <div className="vote-modal-backdrop" role="presentation" onMouseDown={() => setPendingAbility(null)}>
        <section className="vote-modal" role="dialog" aria-modal="true" aria-labelledby="detail-vote-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" onClick={() => setPendingAbility(null)} aria-label="Close vote dialog">×</button>
          {voteCelebrating ? <div className="vote-counted-animation" role="status" aria-live="polite"><span className="vote-counted-ring"><b>✓</b></span><p className="eyebrow">{tx("VOTE LOCKED IN")}</p><h2 id="detail-vote-title">{tx("Vote counted")}</h2><p>{locale === "es" ? "Actualizando el meta de la comunidad..." : "Updating the community meta..."}</p></div> : voteStatus === "Vote recorded. Thank you!" ? <>
            <p className="eyebrow">{tx("VOTE RECORDED")}</p><h2 id="detail-vote-title">{locale === "es" ? "Añade contexto" : "Add your context"}</h2><p>{locale === "es" ? `Explica a otros jugadores de ${hero.name} por qué elegiste ${localizedAbility(pendingAbility).name}.` : <>Tell other {hero.name} players why you chose {pendingAbility.name}, or keep exploring this page.</>}</p>
            <div className="vote-summary"><span>{localizedHeroName(hero)}</span><strong>{localizedAbility(pendingAbility).name}</strong><small>{localizedAbility(pendingAbility).anchorPartner} TEAM-UP</small></div>
            <div className="post-vote-actions detail-post-vote-actions"><button className="share-result-button" type="button" onClick={continueToInsights}><strong>{tx("ADD MY INSIGHT")}</strong><span>{locale === "es" ? "Explica tu voto a la comunidad." : "Explain your vote to the community."}</span><b>↓</b></button><button className="vote-more-button" type="button" onClick={() => setPendingAbility(null)}>{tx("CLOSE")}</button></div>
          </> : <>
            <p className="eyebrow">{tx("ONE LAST STEP")}</p><h2 id="detail-vote-title">{tx("What rank are you?")}</h2><p>{locale === "es" ? "Tu rango y plataforma ayudan a mantener los resultados útiles y comparables." : "Your rank and platform keep the community results useful and comparable."}</p>
            <div className="vote-summary"><span>{localizedHeroName(hero)}</span><strong>{localizedAbility(pendingAbility).name}</strong><small>{localizedAbility(pendingAbility).anchorPartner} TEAM-UP</small></div>
            <div className="modal-ranks">{RANKS.map((rank, index) => <button className={voteRank === rank ? "is-active" : ""} type="button" onClick={() => { setVoteRank(rank); setVoteStatus(""); }} key={rank}><img src={rankImages[rank]} alt="" /><i>{String(index + 1).padStart(2, "0")}</i><span>{tx(rank)}</span></button>)}</div>
            <div className="modal-platforms" role="group" aria-label={locale === "es" ? "Selecciona tu plataforma" : "Select voting platform"}><span>{tx("YOUR PLATFORM")}</span><button className={votePlatform === "PC" ? "is-active" : ""} type="button" onClick={() => { setVotePlatform("PC"); setVoteStatus(""); }}>PC</button><button className={votePlatform === "Console" ? "is-active" : ""} type="button" onClick={() => { setVotePlatform("Console"); setVoteStatus(""); }}>{locale === "es" ? "CONSOLA" : "CONSOLE"}</button></div>
            {voteStatus && <p className="vote-status" aria-live="polite">{voteStatus}</p>}<button className="submit-vote" type="button" onClick={() => void submitVote()} disabled={!voteRank || !votePlatform}>{tx("RECORD MY VOTE")} <b>→</b></button>
          </>}<small className="privacy-note">{locale === "es" ? "Un voto por héroe cada 24 horas. No se necesita una cuenta." : "One vote per hero every 24 hours. No account is required."}</small>
        </section>
      </div>}
    </main>
  );
}
