"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import heroesJson from "@/src/data/heroes.json";
import heroesEsJson from "@/src/data/heroes-es.json";
import heroGuidesJson from "@/src/data/hero-guides.json";
import { RANKS, type Hero, type HeroesData, type PlayerRank, type TeamUpAbility } from "@/src/types";
import { localePath, translate, type SiteLocale } from "@/src/i18n";
import { buildTeamUpAnalysis, MIN_VERDICT_VOTES } from "@/src/teamup-analysis";

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
type HeroGuide = {
  heroId: string;
  creatorId: string;
  creatorLabel: string;
  videoUrl: string;
  language: string;
  uploadDate: string;
  durationSeconds?: number;
  videoTitle?: string;
};
type HeroGuideCreator = { name: string; logo: string; youtube: string; twitch: string; tiktok: string; instagram: string; website: string; discord: string };
const heroGuideData = heroGuidesJson as { creators: Record<string, HeroGuideCreator>; guides: HeroGuide[] };
const heroGuides = heroGuideData.guides;
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
const votedHeroesStorageKey = "rivals-voted-heroes-s10-launch";

function youtubeVideoId(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    if (url.hostname === "youtu.be") return url.pathname.slice(1);
    if (url.hostname.endsWith("youtube.com")) return url.searchParams.get("v") ?? url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1] ?? "";
  } catch {
    return "";
  }
  return "";
}

function videoDuration(seconds?: number) {
  if (!seconds) return undefined;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${remainingSeconds ? `${remainingSeconds}S` : ""}`;
}

function decodeHtmlEntities(value: string) {
  const namedEntities: Record<string, string> = {
    "&amp;": "&",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&lt;": "<",
    "&gt;": ">",
  };
  return value
    .replace(/&(amp|apos|quot|lt|gt);|&#39;/g, (entity) => namedEntities[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

export default function HeroDetailClient({ hero, locale = "en", initialVotes = {} }: { hero: Hero; locale?: SiteLocale; initialVotes?: LiveVotes }) {
  const featuredGuide = heroGuides.find((guide) => guide.heroId === hero.id);
  const featuredCreator = featuredGuide ? heroGuideData.creators[featuredGuide.creatorId] : undefined;
  const tx = (value: string) => translate(locale, value);
  const path = (value: string) => localePath(locale, value);
  const localizedHeroName = (item: Hero) => locale === "es" ? (spanishHeroNames.get(item.id) ?? item.name) : item.name;
  const localizedAbility = (ability: TeamUpAbility) => { const spanish = spanishAbilities.get(ability.id); return locale === "es" && spanish ? { ...ability, name: spanish.nameEs, anchorPartner: spanish.anchorPartnerEs, baseDescription: spanish.baseDescriptionEs, enhancedDescription: spanish.enhancedDescriptionEs } : ability; };
  const guideAbilities = hero.teamUpAbilities.map(localizedAbility);
  const guideHeroName = localizedHeroName(hero);
  const guideTitle = locale === "es" ? `¿CUÁL ES EL MEJOR TEAM-UP DE ${guideHeroName}?` : `WHICH ${guideHeroName} TEAM-UP IS BEST?`;
  const guideDescription = locale === "es"
    ? `${guideHeroName} tiene dos opciones de Team-Up en la Temporada 9.5 de Marvel Rivals: ${guideAbilities[0].name} con ${guideAbilities[0].anchorPartner} y ${guideAbilities[1].name} con ${guideAbilities[1].anchorPartner}. Ambas ofrecen ventajas diferentes, pero ¿cuál Team-Up de ${guideHeroName} es mejor? Este video destacado compara sus fortalezas, debilidades y mejores situaciones de uso.`
    : `${guideHeroName} gets two Team-Up options in Marvel Rivals Season 10: ${guideAbilities[0].name} with ${guideAbilities[0].anchorPartner} and ${guideAbilities[1].name} with ${guideAbilities[1].anchorPartner}. Both offer different advantages, but which ${guideHeroName} Team-Up is better? This featured video compares their strengths, weaknesses, and best use cases.`;
  const guideVideoId = featuredGuide ? youtubeVideoId(featuredGuide.videoUrl) : "";
  const guideVideoTitle = featuredGuide?.videoTitle ? decodeHtmlEntities(featuredGuide.videoTitle) : guideTitle;
  const guideStructuredData = featuredGuide && featuredCreator && guideVideoId ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: guideVideoTitle,
    description: guideDescription,
    thumbnailUrl: [`https://i.ytimg.com/vi/${guideVideoId}/hqdefault.jpg`],
    uploadDate: featuredGuide.uploadDate,
    ...(featuredGuide.durationSeconds ? { duration: videoDuration(featuredGuide.durationSeconds) } : {}),
    embedUrl: `https://www.youtube.com/embed/${guideVideoId}`,
    url: `https://rivalsteamups.com${path(`/heroes/${hero.id}`)}`,
    inLanguage: locale === "es" ? "es" : "en",
    publisher: {
      "@type": "Organization",
      name: featuredCreator.name,
      url: featuredCreator.youtube,
      logo: `https://rivalsteamups.com${featuredCreator.logo}`,
      sameAs: [featuredCreator.youtube, featuredCreator.twitch, featuredCreator.tiktok, featuredCreator.instagram, featuredCreator.website],
    },
    potentialAction: {
      "@type": "WatchAction",
      target: `https://rivalsteamups.com${path(`/heroes/${hero.id}`)}`,
    },
  } : null;
  const [liveVotes, setLiveVotes] = useState<LiveVotes>(initialVotes);
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
  const [guidePlaying, setGuidePlaying] = useState(false);

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
      const votedHeroes = JSON.parse(localStorage.getItem(votedHeroesStorageKey) || "[]") as unknown;
      const next = Array.isArray(votedHeroes) ? [...new Set([...votedHeroes.filter((id): id is string => typeof id === "string"), hero.id])] : [hero.id];
      localStorage.setItem(votedHeroesStorageKey, JSON.stringify(next));
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
    return { rank, counts, total, percentages: counts.map((count) => total ? Math.round((count / total) * 100) : 0) as [number, number] };
  }), [hero, liveVotes, platform]);

  const selectedRow = selectedRank === "All Ranks" ? null : rows.find((row) => row.rank === selectedRank);
  const totals = (selectedRow?.counts ?? hero.teamUpAbilities.map((_, index) => rows.reduce((sum, row) => sum + row.counts[index], 0))) as [number, number];
  const totalVotes = totals[0] + totals[1];
  const isTied = totalVotes > 0 && totals[0] === totals[1];
  const leaderIndex = totals[1] > totals[0] ? 1 : 0;
  const leader = localizedAbility(hero.teamUpAbilities[leaderIndex]);
  const leaderPercent = totalVotes ? Math.round((totals[leaderIndex] / totalVotes) * 100) : 0;
  const hasMeaningfulSample = totalVotes >= MIN_VERDICT_VOTES;
  const hasCommunityLeader = hasMeaningfulSample && !isTied;
  const localizedAbilities = hero.teamUpAbilities.map(localizedAbility) as [TeamUpAbility, TeamUpAbility];
  const teamUpAnalysis = buildTeamUpAnalysis({ hero, heroName: localizedHeroName(hero), abilities: localizedAbilities, totals, locale });
  const rolePeers = heroData.heroes.filter((candidate) => candidate.role === hero.role && candidate.id !== hero.id);
  const roleAnchor = `${hero.role.toLowerCase()}s`;
  const featuredInsight = insights[0];

  return (
    <main className={`detail-shell detail-${hero.role.toLowerCase()}`} style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties}>
      <header className="topbar detail-topbar">
        <a className="brand" href={path("/")} aria-label="Rivals Team-Up Meta home">
          <span className="brand-mark">R</span>
          <span><strong>RIVALS</strong><small>TEAM-UPS</small></span>
        </a>
        <a href={`${path("/")}#hero-${hero.id}`} className="detail-back">← {tx("BACK TO DIRECTORY")}</a>
        <a className="language-switch" href={locale === "es" ? `/heroes/${hero.id}` : `/es/heroes/${hero.id}`} hrefLang={locale === "es" ? "en" : "es"}>{locale === "es" ? "EN" : "ES"}</a>
      </header>

      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">{tx("SEASON 10 · HERO INTELLIGENCE")}</p>
          <div className="detail-role"><img src={`/roles/${hero.role.toLowerCase()}.webp`} alt="" />{hero.role}</div>
          <h1><img className="mobile-detail-hero-icon" src={`/heroes/${hero.id}.webp`} alt="" />{localizedHeroName(hero)}</h1>
          <p>{locale === "es" ? `Compara el Team-Up ${localizedAbility(hero.teamUpAbilities[0]).name} de ${localizedHeroName(hero)} con ${localizedAbility(hero.teamUpAbilities[1]).name}. Consulta las preferencias por rango y plataforma, los dos aliados ancla y todos los efectos mejorados de la Temporada 10.` : <>Compare {hero.name}&apos;s {hero.teamUpAbilities[0].name} Team-Up with {hero.teamUpAbilities[1].name}. Explore community preference by competitive rank and platform, review both anchor partners, and preview every Enhanced effect for Season 10.</>}</p>
          <div className="detail-summary-grid">
            <div><span>{tx("TOTAL VOTES")}</span><strong>{totalVotes.toLocaleString()}</strong></div>
            <div><span>{tx("COMMUNITY LEADER")}</span><strong>{!totalVotes ? (locale === "es" ? "Sin líder aún" : "No leader yet") : isTied ? (locale === "es" ? "Empate" : "Tied") : leader.name}</strong><small>{!totalVotes ? (locale === "es" ? "Esperando votos" : "Awaiting votes") : isTied ? (locale === "es" ? "Preferencia dividida por igual" : "Preference split evenly") : `${leaderPercent}% ${locale === "es" ? "de preferencia" : "preference"}`}</small></div>
            <div><span>{tx("LEAD MARGIN")}</span><strong>{totalVotes ? Math.abs(totals[0] - totals[1]).toLocaleString() : "—"}</strong><small>{totalVotes ? (locale === "es" ? "votos de diferencia" : "votes between options") : (locale === "es" ? "Sin muestra todavía" : "No sample yet")}</small></div>
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
        <aside className="results-methodology-note" aria-label={locale === "es" ? "Cómo interpretar estos resultados" : "How to read these results"}>
          <strong>{locale === "es" ? "CÓMO LEER ESTOS RESULTADOS" : "HOW TO READ THESE RESULTS"}</strong>
          <p>{locale === "es" ? "Los resultados provienen de votos de visitantes filtrados por plataforma y rango competitivo. Las muestras pequeñas se identifican como señales tempranas y no deben tratarse como clasificaciones definitivas." : "Results come from visitor votes filtered by platform and competitive rank. Small samples are identified as early signals and should not be treated as definitive rankings."} <a href={path("/about")}>{locale === "es" ? "Metodología completa →" : "Full methodology →"}</a></p>
        </aside>
        <div className="detail-teamups">
          {hero.teamUpAbilities.map((ability, index) => {
            const displayAbility = localizedAbility(ability);
            const anchor = heroByName.get(ability.anchorPartner.toLowerCase());
            const percentage = totalVotes ? Math.round((totals[index] / totalVotes) * 100) : 0;
            return <article className={`${hasCommunityLeader && index === leaderIndex ? "is-leader" : ""} ${enhanced ? "is-enhanced" : ""}`} key={ability.id}>
              {hasCommunityLeader && index === leaderIndex && <b className="detail-choice-badge">{tx("COMMUNITY CHOICE")}</b>}
              <div className="detail-anchor"><img className={enhanced ? "is-animated" : ""} src={anchor ? `/${enhanced ? "lord-icons" : "heroes"}/${anchor.id}.webp` : `/${enhanced ? "lord-icons" : "heroes"}/hulk.webp`} alt="" /><span><small>{locale === "es" ? "ANCLA" : "ANCHOR"}</small><strong>{displayAbility.anchorPartner}</strong></span><em>{totalVotes ? `${percentage}%` : "—"}</em></div>
              <span className="ability-source-label">{locale === "es" ? "INFORMACIÓN DE LA HABILIDAD EN EL JUEGO" : "IN-GAME ABILITY INFORMATION"}</span><h3>{displayAbility.name}</h3><p>{displayAbility.baseDescription}</p>
              {enhanced && <p className="enhanced-addon"><strong>⚡ {locale === "es" ? "MEJORADO:" : "ENHANCED:"}</strong> {displayAbility.enhancedDescription}</p>}
              <footer><span>{totals[index].toLocaleString()} {locale === "es" ? "votos" : "votes"}</span><strong>{totalVotes ? `${percentage}% ${locale === "es" ? "de la comunidad" : "of community"}` : (locale === "es" ? "Esperando votos" : "Awaiting votes")}</strong></footer>
              <button className="detail-vote-button" type="button" onClick={() => openVote(ability)}>{tx("VOTE FOR")} {displayAbility.anchorPartner.toUpperCase()} TEAM-UP <b>+</b></button>
            </article>;
          })}
        </div>
        {totalVotes < MIN_VERDICT_VOTES && <p className="sample-size-notice" role="status"><strong>{totalVotes === 0 ? (locale === "es" ? "AÚN NO HAY RESULTADO" : "NO RESULT YET") : (locale === "es" ? "SEÑAL TEMPRANA" : "EARLY SIGNAL")}</strong><span>{totalVotes === 0 ? (locale === "es" ? "Esta vista no tiene votos. No mostramos un 50/50 artificial." : "This view has no votes, so an artificial 50/50 result is not shown.") : (locale === "es" ? `Solo hay ${totalVotes} votos en esta vista. La preferencia puede cambiar rápidamente.` : `Only ${totalVotes} votes are in this view. The preference can still change quickly.`)}</span></p>}

        {featuredGuide && featuredCreator && guideVideoId && <section className="featured-guide-preview" aria-labelledby="featured-guide-title">
          {guideStructuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideStructuredData).replace(/</g, "\\u003c") }} />}
          <div className="featured-guide-art">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${guideVideoId}?${guidePlaying ? "autoplay=1&" : ""}rel=0`}
              title={`${guideHeroName} Team-Up video by ${featuredCreator.name}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            {!guidePlaying && <button type="button" onClick={() => setGuidePlaying(true)} aria-label={`${locale === "es" ? "Reproducir video sobre" : "Play video about"} ${guideHeroName}`}>
              <img
                src={`https://i.ytimg.com/vi/${guideVideoId}/maxresdefault.jpg`}
                alt={`${guideHeroName} Team-Up video by ${featuredCreator.name}`}
                onError={(event) => {
                  if (event.currentTarget.src.includes("maxresdefault")) event.currentTarget.src = `https://i.ytimg.com/vi/${guideVideoId}/hqdefault.jpg`;
                }}
              />
              <span className="guide-play" aria-hidden="true"><i /></span>
            </button>}
          </div>
          <div className="featured-guide-copy">
            <p className="eyebrow">{locale === "es" ? "VIDEO DE UN CREADOR COLABORADOR" : "PARTNER CREATOR VIDEO"}</p>
            <h2 id="featured-guide-title">{guideVideoTitle}</h2>
            <p>{guideDescription}</p>
            <div className="guide-tags"><span>SEASON 10</span><span>{hero.role.toUpperCase()}</span></div>
            <div className="guide-creator">
              <img src={featuredCreator.logo} alt={`${featuredCreator.name} logo`} />
              <span><small>{featuredGuide.creatorLabel.toUpperCase()}</small><strong>{featuredCreator.name}</strong></span>
              <a href={featuredGuide.videoUrl} target="_blank" rel="noreferrer">{locale === "es" ? "VER VIDEO ↗" : "WATCH VIDEO ↗"}</a>
            </div>
            <nav className="guide-socials" aria-label={`${featuredCreator.name} social links`}>
              <a href={featuredCreator.youtube} target="_blank" rel="noreferrer"><img src="/creators/social/youtube.png" alt="" />YouTube</a>
              <a href={featuredCreator.twitch} target="_blank" rel="noreferrer"><img src="/creators/social/twitch.png" alt="" />Twitch</a>
              <a href={featuredCreator.tiktok} target="_blank" rel="noreferrer"><img src="/creators/social/tiktok.png" alt="" />TikTok</a>
              <a href={featuredCreator.instagram} target="_blank" rel="noreferrer"><img src="/creators/social/instagram.png" alt="" />Instagram</a>
              <a href={featuredCreator.discord} target="_blank" rel="noreferrer"><img src="/creators/social/discord.png" alt="" />Discord</a>
            </nav>
          </div>
        </section>}

        <aside className="role-discovery" aria-labelledby="role-discovery-title">
          <div className="role-discovery-heading">
            <div>
              <span>{tx("EXPLORE THE ROSTER")}</span>
              <h2 id="role-discovery-title">
                {locale === "es" ? `Descubre otros héroes del rol ${tx(hero.role)}` : `Discover other ${hero.role} heroes`}
              </h2>
            </div>
            <img src={`/roles/${hero.role.toLowerCase()}.webp`} alt="" />
          </div>
          <p>
            {locale === "es"
              ? `Compara las preferencias de Team-Up y las tendencias clasificatorias de la comunidad de otros héroes del rol ${tx(hero.role)}.`
              : `Compare Team-Up preferences and ranked community trends for other heroes in the ${hero.role} role.`}
          </p>
          <div className="role-peer-list">
            {rolePeers.map((peer) => <a href={path(`/heroes/${peer.id}`)} key={peer.id} aria-label={locale === "es" ? `Ver detalles de ${localizedHeroName(peer)}` : `View ${peer.name} details`}>
              <img src={`/heroes/${peer.id}.webp`} alt="" />
              <span>{localizedHeroName(peer)}</span>
            </a>)}
          </div>
          <a className="role-discovery-all" href={`${path("/")}#${roleAnchor}`}>
            {locale === "es" ? `VER TODOS LOS HÉROES DEL ROL ${tx(hero.role).toUpperCase()}` : `VIEW ALL ${hero.role.toUpperCase()} HEROES`} <b>›</b>
          </a>
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

        <section className="teamup-analysis" aria-labelledby="teamup-analysis-title">
          <div className="detail-section-heading"><div><h2 id="teamup-analysis-title">{locale === "es" ? "Análisis de Team-Ups" : "Team-Up analysis"}</h2></div><p>{locale === "es" ? "Fortalezas, riesgos y situaciones ideales para cada opción." : "Strengths, tradeoffs, and ideal situations for each option."}</p></div>
          <div className="analysis-intro"><p>{teamUpAnalysis.intro}</p></div>
          <div className="analysis-options">
            {localizedAbilities.map((ability, index) => <article key={ability.id}><span>{locale === "es" ? "OPCIÓN" : "OPTION"} {index + 1}</span><h3>{ability.name}</h3><small>{locale === "es" ? "ANCLA" : "ANCHOR"} · {ability.anchorPartner}</small><p>{teamUpAnalysis.options[index]}</p></article>)}
          </div>
          <aside className={`analysis-verdict ${totalVotes < MIN_VERDICT_VOTES ? "is-provisional" : ""}`}><strong>{locale === "es" ? "VEREDICTO ACTUAL" : "CURRENT VERDICT"}</strong><p>{teamUpAnalysis.verdict}</p></aside>
          <aside className="analysis-author"><span className="author-monogram" aria-hidden="true">DR</span><p><strong>{locale === "es" ? "Análisis de DeAngelo Robinson" : "Analysis by DeAngelo Robinson"}</strong><small>{locale === "es" ? "Basado en las mecánicas de las habilidades y los datos de votación de la comunidad." : "Based on ability mechanics and current community voting data."}</small></p><a href={path("/about")}>{locale === "es" ? "ACERCA DEL EDITOR →" : "ABOUT THE EDITOR →"}</a></aside>
        </section>

        <div className="detail-section-heading"><div><h2>{tx("Detailed rank breakdown")}</h2></div><p>{locale === "es" ? "Observa cómo cambian las preferencias al subir de rango competitivo." : "See how preference changes as the competitive tier rises."}</p></div>
        <div className="rank-breakdown">
          {rows.map((row) => <article key={row.rank}>
            <div className="breakdown-rank"><img src={rankImages[row.rank]} alt="" /><span><strong>{row.rank}</strong><small>{row.total.toLocaleString()} votes</small></span></div>
            <div className="breakdown-bars">
              {hero.teamUpAbilities.map((ability, index) => <div className={row.total ? "" : "is-empty"} key={ability.id}><span><b>{localizedAbility(ability).name} ({localizedAbility(ability).anchorPartner})</b><em>{row.total ? `${row.counts[index]} · ${row.percentages[index]}%` : (locale === "es" ? "Sin votos" : "No votes")}</em></span><i><b style={{ width: `${row.percentages[index]}%` }} /></i></div>)}
            </div>
          </article>)}
        </div>

      </section>
      <footer className="detail-legal-footer"><span>RIVALS TEAM-UPS // {platform.toUpperCase()} COMMUNITY META</span><nav className="legal-links"><a href={path("/about")}>{locale === "es" ? "ACERCA DE Y METODOLOGÍA" : "ABOUT & METHODOLOGY"}</a><a href="/contact">CONTACT</a><a href="/legal-notice">LEGAL NOTICE</a><a href="/privacy-policy">PRIVACY</a><a href="/terms-of-use">TERMS</a><a href="/cookie-policy">COOKIES</a></nav><a href="/">DIRECTORY ↑</a></footer>
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
