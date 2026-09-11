"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import heroesJson from "@/src/data/heroes.json";
import heroesEsJson from "@/src/data/heroes-es.json";
import { RANKS, type Hero, type HeroRole, type HeroesData, type PlayerRank, type TeamUpAbility } from "@/src/types";
import { localePath, translate, type SiteLocale } from "@/src/i18n";

const heroData = heroesJson as HeroesData;
type SpanishAbility = TeamUpAbility & { nameEs: string; anchorPartnerEs: string; baseDescriptionEs: string; enhancedDescriptionEs: string };
type SpanishHero = { id: string; nameEs: string; teamUpAbilities: SpanishAbility[] };
const spanishHeroes = (heroesEsJson as unknown as { heroes: SpanishHero[] }).heroes;
const spanishHeroNames = new Map(spanishHeroes.map((hero) => [hero.id, hero.nameEs]));
const spanishAbilities = new Map(spanishHeroes.flatMap((hero) => hero.teamUpAbilities).map((ability) => [ability.id, ability]));
const roles: HeroRole[] = ["Vanguard", "Duelist", "Strategist"];
const rankFilters = ["All Ranks", ...RANKS] as const;
type RankFilter = (typeof rankFilters)[number];
type LiveVotes = Record<string, Record<string, number>>;
const resultEras = [
  { id: "s10-launch", season: "Season 10", patch: "S10 Launch", label: "S10 · Cumulative" },
  { id: "s9-5-launch", season: "Season 09", patch: "S9 Launch", label: "S9.5 · Launch" },
] as const;
type ResultEra = (typeof resultEras)[number];
type ResultWindow = "all" | "recent";
type Platform = "PC" | "Console";
const enhancedPreferenceKey = "rivals-enhanced-heroes";
const votedHeroesStorageKey = "rivals-voted-heroes-s10-launch";
const season10UpdatedHeroIds = new Set([
  "black-cat",
  "blade",
  "gambit",
  "iron-fist",
  "luna-snow",
  "mister-fantastic",
  "namor",
]);
// Update this ID whenever a new hero releases. The newest hero remains featured
// until the next release replaces it.
const newestHeroId = "gorr";

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
  "All Ranks": "#43ddff",
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

const roleEditorial: Record<HeroRole, { en: { title: string; paragraphs: string[] }; es: { title: string; paragraphs: string[] } }> = {
  Vanguard: {
    en: { title: "How to evaluate Vanguard Team-Ups", paragraphs: ["Vanguard Team-Ups should earn their place by helping the front line take or retain space. Defensive effects are most valuable when they protect an initiation window, deny predictable enemy damage, or let the Vanguard remain threatening without exhausting team resources.", "Compare each option against the way your composition starts fights. Mobility and control can create cleaner engagements, while barriers and sustain offer more value in slower objective battles. The community result is useful context, but map geometry and the anchor hero's fit still determine which choice works in a specific match."] },
    es: { title: "Cómo evaluar los Team-Ups de Vanguardia", paragraphs: ["Los Team-Ups de Vanguardia deben ayudar a la primera línea a tomar o conservar espacio. Los efectos defensivos tienen más valor cuando protegen una iniciación, bloquean daño predecible o permiten mantener la presión sin agotar los recursos del equipo.", "Compara cada opción con la forma en que tu composición inicia los combates. La movilidad y el control pueden crear entradas más limpias; las barreras y la supervivencia destacan en peleas prolongadas por el objetivo. El resultado comunitario aporta contexto, pero el mapa y la utilidad del héroe ancla siguen siendo decisivos."] },
  },
  Duelist: {
    en: { title: "How to evaluate Duelist Team-Ups", paragraphs: ["Duelist Team-Ups are strongest when they improve reliable pressure rather than only raising theoretical burst damage. Look for effects that help the hero reach a target, maintain uptime, finish an elimination, or escape after committing to a play.", "A damage-focused option can dominate when your team creates clear openings, while mobility or control may be more dependable in uncoordinated fights. Consider how often the effect can be activated and whether its anchor naturally belongs in the composition before treating the community leader as the automatic choice."] },
    es: { title: "Cómo evaluar los Team-Ups de Duelista", paragraphs: ["Los Team-Ups de Duelista son más fuertes cuando mejoran la presión constante y no solo el daño explosivo teórico. Busca efectos que ayuden al héroe a alcanzar un objetivo, mantener actividad, asegurar una eliminación o escapar después de comprometerse.", "Una opción de daño puede dominar cuando el equipo crea oportunidades claras, mientras que la movilidad o el control suelen ser más fiables en peleas sin coordinación. Considera la frecuencia de activación y si el héroe ancla encaja naturalmente antes de tratar al líder comunitario como una elección automática."] },
  },
  Strategist: {
    en: { title: "How to evaluate Strategist Team-Ups", paragraphs: ["Strategist Team-Ups need to be judged by more than personal damage. The best option may extend healing access, protect an ally through burst, improve survival under pressure, or provide control that prevents damage before it happens.", "Think about which weakness your composition still needs to solve. Extra sustain is effective in long fights, but mobility or disruption can be more important against dive pressure. A popular vote identifies what players find dependable; it does not replace the decision between protecting your team and adding offensive tempo."] },
    es: { title: "Cómo evaluar los Team-Ups de Estratega", paragraphs: ["Los Team-Ups de Estratega deben evaluarse por más que el daño personal. La mejor opción puede ampliar el acceso a curación, proteger a un aliado del daño explosivo, mejorar la supervivencia bajo presión o aportar control que evite daño antes de recibirlo.", "Piensa qué debilidad necesita resolver tu composición. La supervivencia adicional funciona en combates largos, pero la movilidad o la interrupción pueden ser más importantes contra ataques directos. Un voto popular señala lo que los jugadores consideran fiable; no sustituye la decisión entre protección y ritmo ofensivo."] },
  },
};

type PendingVote = { hero: Hero; ability: TeamUpAbility };
const heroImage = (heroId: string) => `/heroes/${heroId}.webp`;
const lordImage = (heroId: string) => `/lord-icons/${heroId}.webp`;
const roleImage = (role: HeroRole) => `/roles/${role.toLowerCase()}.webp`;
const heroByName = new Map(heroData.heroes.map((hero) => [hero.name.toLowerCase(), hero]));
heroByName.set("deadpool", heroData.heroes.find((hero) => hero.id === "deadpool-duelist")!);
const anchorImage = (anchorPartner: string, enhanced = false) => {
  if (anchorPartner.toLowerCase() === "the hood") return enhanced ? lordImage("the-hood") : heroImage("the-hood");
  const anchor = heroByName.get(anchorPartner.toLowerCase());
  return anchor ? (enhanced ? lordImage(anchor.id) : heroImage(anchor.id)) : "/heroes/hulk.webp";
};

export default function Home({ roleFilter, locale = "en", initialVotes = {} }: { roleFilter?: HeroRole; locale?: SiteLocale; initialVotes?: LiveVotes } = {}) {
  const tx = (value: string) => translate(locale, value);
  const path = (value: string) => localePath(locale, value);
  const localizedHeroName = (hero: Hero) => locale === "es" ? (spanishHeroNames.get(hero.id) ?? hero.name) : hero.name;
  const localizedAbility = (ability: TeamUpAbility) => { const spanish = spanishAbilities.get(ability.id); return locale === "es" && spanish ? { ...ability, name: spanish.nameEs, anchorPartner: spanish.anchorPartnerEs, baseDescription: spanish.baseDescriptionEs, enhancedDescription: spanish.enhancedDescriptionEs } : ability; };
  const [enhancedHeroes, setEnhancedHeroes] = useState<Record<string, boolean>>({});
  const [liveVotes, setLiveVotes] = useState<LiveVotes>(initialVotes);
  const [selectedRank, setSelectedRank] = useState<RankFilter>("All Ranks");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingVote, setPendingVote] = useState<PendingVote | null>(null);
  const [voteRank, setVoteRank] = useState<PlayerRank | "">("");
  const [votePlatform, setVotePlatform] = useState<Platform | "">("");
  const [voteStatus, setVoteStatus] = useState("");
  const [voteCelebrating, setVoteCelebrating] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [votedHeroIds, setVotedHeroIds] = useState<string[]>([]);
  const [selectedEra, setSelectedEra] = useState<ResultEra>(resultEras[0]);
  const [resultWindow, setResultWindow] = useState<ResultWindow>("all");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [collapsedRoles, setCollapsedRoles] = useState<Record<HeroRole, boolean>>({ Vanguard: false, Duelist: false, Strategist: false });
  const [platform, setPlatform] = useState<Platform>("PC");
  const [showEnhancedDiscovery, setShowEnhancedDiscovery] = useState(false);

  const loadVotes = useCallback(async () => {
    try {
      const params = new URLSearchParams({ season: selectedEra.season, patch: selectedEra.patch, window: resultWindow, platform });
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
  }, [selectedEra, resultWindow, platform]);

  useEffect(() => { void loadVotes(); }, [loadVotes]);
  useEffect(() => { const saved = localStorage.getItem("rivals-platform"); if (saved === "Console") setPlatform("Console"); }, []);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(enhancedPreferenceKey) || "{}");
      if (saved && typeof saved === "object") setEnhancedHeroes(saved as Record<string, boolean>);
    } catch {
      localStorage.removeItem(enhancedPreferenceKey);
    }
    setShowEnhancedDiscovery(true);
  }, []);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(votedHeroesStorageKey) || "[]");
      if (Array.isArray(saved)) setVotedHeroIds(saved.filter((id): id is string => typeof id === "string"));
    } catch {
      localStorage.removeItem(votedHeroesStorageKey);
    }
  }, []);

  function choosePlatform(next: Platform) {
    setPlatform(next);
    localStorage.setItem("rivals-platform", next);
  }

  function toggleEnhanced(heroId: string) {
    setEnhancedHeroes((current) => {
      const next = { ...current, [heroId]: !current[heroId] };
      localStorage.setItem(enhancedPreferenceKey, JSON.stringify(next));
      return next;
    });
    setShowEnhancedDiscovery(false);
  }

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

  const visibleRoles = roleFilter ? [roleFilter] : roles;
  const directoryHeroes = useMemo(() => (roleFilter ? heroData.heroes.filter((hero) => hero.role === roleFilter) : heroData.heroes).slice().sort((a, b) => a.name.localeCompare(b.name)), [roleFilter]);
  const roleDiscoveryHeroIds = new Set(visibleRoles.map((role) => heroData.heroes
    .filter((hero) => hero.role === role)
    .sort((a, b) => a.name.localeCompare(b.name))[0]?.id));

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return directoryHeroes.filter((hero) => !normalized || hero.name.toLowerCase().includes(normalized) || localizedHeroName(hero).toLowerCase().includes(normalized));
  }, [query, directoryHeroes]);

  function liveCount(abilityId: string, filter: RankFilter) {
    if (filter !== "All Ranks") return liveVotes[filter]?.[abilityId] ?? 0;
    return RANKS.reduce((sum, rank) => sum + (liveVotes[rank]?.[abilityId] ?? 0), 0);
  }

  function abilityCount(hero: Hero, ability: TeamUpAbility) {
    return liveCount(ability.id, selectedRank);
  }

  function chooseSuggestion(hero: Hero) {
    setQuery(localizedHeroName(hero));
    setSearchOpen(false);
    document.getElementById(`hero-${hero.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function openVote(hero: Hero, ability: TeamUpAbility) {
    if (selectedEra.id !== resultEras[0].id) setSelectedEra(resultEras[0]);
    setPendingVote({ hero, ability });
    setVoteStatus("");
    setVoteCelebrating(false);
    setShareStatus("");
    const savedRank = localStorage.getItem("rivals-vote-rank");
    const savedPlatform = localStorage.getItem("rivals-platform");
    setVoteRank(selectedRank === "All Ranks" ? (RANKS.includes(savedRank as PlayerRank) ? savedRank as PlayerRank : "") : selectedRank);
    setVotePlatform(savedPlatform === "PC" || savedPlatform === "Console" ? savedPlatform : platform);
  }

  async function submitVote() {
    if (!pendingVote || !voteRank || !votePlatform) {
      setVoteStatus("Choose your competitive rank and platform to continue.");
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
          platform: votePlatform,
        }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error || "Vote could not be saved");
      }
      choosePlatform(votePlatform);
      localStorage.setItem("rivals-vote-rank", voteRank);
      setVotedHeroIds((current) => {
        const next = current.includes(pendingVote.hero.id) ? current : [...current, pendingVote.hero.id];
        localStorage.setItem(votedHeroesStorageKey, JSON.stringify(next));
        return next;
      });
      setVoteStatus("Vote counted!");
      setVoteCelebrating(true);
      window.setTimeout(() => {
        setVoteCelebrating(false);
        setVoteStatus("Vote recorded. Thank you!");
      }, 950);
    } catch (error) {
      setVoteStatus(error instanceof Error ? error.message : "Vote could not be saved. Please try again.");
    }
  }

  async function shareVoteResult() {
    if (!pendingVote || !voteRank || !votePlatform) return;
    setShareStatus("CREATING CARD...");
    const hero = pendingVote.hero;
    const selectedAbility = pendingVote.ability;
    const otherAbility = hero.teamUpAbilities.find((ability) => ability.id !== selectedAbility.id)!;
    const selectedVotes = liveCount(selectedAbility.id, voteRank) + 1;
    const otherVotes = liveCount(otherAbility.id, voteRank);
    const percentage = Math.round((selectedVotes / Math.max(1, selectedVotes + otherVotes)) * 100);
    const url = `${window.location.origin}/heroes/${hero.id}`;
    const caption = `I voted for ${selectedAbility.name} as ${hero.name}'s better Team-Up. ${voteRank} ${votePlatform} players currently give it ${percentage}% of the vote. Cast yours: ${url}`;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d");
    if (!context) return;
    const gradient = context.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, "#071019");
    gradient.addColorStop(.65, "#101a29");
    gradient.addColorStop(1, "#132f39");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 630);
    context.fillStyle = "#43ddff";
    context.fillRect(0, 0, 12, 630);
    context.fillStyle = "rgba(67,221,255,.09)";
    context.beginPath();
    context.arc(1040, 90, 330, 0, Math.PI * 2);
    context.fill();
    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
    try {
      const image = await loadImage(heroImage(hero.id));
      context.save();
      context.beginPath();
      context.arc(180, 183, 116, 0, Math.PI * 2);
      context.clip();
      context.drawImage(image, 64, 67, 232, 232);
      context.restore();
      context.strokeStyle = "#43ddff";
      context.lineWidth = 5;
      context.beginPath();
      context.arc(180, 183, 116, 0, Math.PI * 2);
      context.stroke();
    } catch { /* The text-only card remains shareable. */ }
    context.fillStyle = "#43ddff";
    context.font = "700 24px monospace";
    context.fillText("RIVALS TEAM-UPS // COMMUNITY VOTE", 340, 92);
    context.fillStyle = "#ffffff";
    context.font = "900 64px Arial, sans-serif";
    context.fillText(hero.name.toUpperCase(), 340, 175);
    context.fillStyle = "#a7b5c7";
    context.font = "700 25px monospace";
    context.fillText(`${voteRank.toUpperCase()} · ${votePlatform.toUpperCase()}`, 342, 218);
    context.fillStyle = "#ffffff";
    context.font = "800 43px Arial, sans-serif";
    context.fillText(selectedAbility.name.toUpperCase(), 70, 388);
    context.fillStyle = "#b8f34a";
    context.font = "900 104px Arial, sans-serif";
    context.textAlign = "right";
    context.fillText(`${percentage}%`, 1125, 413);
    context.textAlign = "left";
    context.fillStyle = "#a7b5c7";
    context.font = "700 23px monospace";
    context.fillText(`${selectedAbility.anchorPartner.toUpperCase()} TEAM-UP`, 72, 438);
    context.strokeStyle = "#314154";
    context.beginPath();
    context.moveTo(70, 485);
    context.lineTo(1130, 485);
    context.stroke();
    context.fillStyle = "#43ddff";
    context.font = "800 27px monospace";
    context.fillText("CAST YOUR VOTE", 70, 550);
    context.fillStyle = "#ffffff";
    context.textAlign = "right";
    context.fillText("RIVALSTEAMUPS.COM", 1130, 550);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], `${hero.id}-team-up-result.png`, { type: "image/png" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${hero.name} Team-Up vote`, text: caption, url, files: [file] });
        setShareStatus("SHARED");
      } else {
        await navigator.clipboard.writeText(caption);
        const download = document.createElement("a");
        download.href = URL.createObjectURL(blob);
        download.download = file.name;
        download.click();
        URL.revokeObjectURL(download.href);
        setShareStatus("CARD SAVED · CAPTION COPIED");
      }
    } catch (error) {
      setShareStatus(error instanceof Error && error.name === "AbortError" ? "" : "SHARING WAS NOT AVAILABLE");
    }
  }

  const completedHeroes = directoryHeroes.filter((hero) => votedHeroIds.includes(hero.id)).length;
  const progressPercent = Math.round((completedHeroes / Math.max(1, directoryHeroes.length)) * 100);
  const featuredHero = useMemo(
    () => heroData.heroes.find((hero) => hero.id === newestHeroId) ?? heroData.heroes[0],
    [],
  );
  const [featuredAbilityA, featuredAbilityB] = featuredHero.teamUpAbilities;
  const featuredDisplayA = localizedAbility(featuredAbilityA);
  const featuredDisplayB = localizedAbility(featuredAbilityB);
  const featuredVotesA = abilityCount(featuredHero, featuredAbilityA);
  const featuredVotesB = abilityCount(featuredHero, featuredAbilityB);
  const featuredTotal = featuredVotesA + featuredVotesB;
  const featuredPercentA = featuredTotal ? Math.round(featuredVotesA / featuredTotal * 100) : 50;
  const featuredPercentB = 100 - featuredPercentA;

  function focusFeaturedHero() {
    setCollapsedRoles((current) => ({ ...current, [featuredHero.role]: false }));
    window.setTimeout(() => document.getElementById(`hero-${featuredHero.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  return (
    <main className="app-shell" id="top">
      <aside className="season-announcement" aria-label={locale === "es" ? "Anuncio de la Temporada 10" : "Season 10 announcement"}>
        <strong>{locale === "es" ? "TEMPORADA 10 EN VIVO — GORR HA LLEGADO · TEAM-UPS ACTUALIZADOS" : "SEASON 10 IS LIVE — GORR HAS ARRIVED · TEAM-UPS UPDATED"}</strong>
        <a href={path("/#hero-gorr")}>{locale === "es" ? "VER A GORR" : "VIEW GORR"} <b>→</b></a>
      </aside>
      <header className="topbar">
        <a className="brand" href={roleFilter ? path("/") : "#top"} aria-label="Rivals Team-Ups home">
          <span className="brand-mark">R</span>
          <span><strong>RIVALS</strong><small>TEAM-UPS</small></span>
        </a>
        <nav className="role-nav" aria-label="Hero roles">
          <a href={roleFilter ? path("/roles/vanguards") : "#vanguards"}>{tx("Vanguards")}</a><a href={roleFilter ? path("/roles/duelists") : "#duelists"}>{tx("Duelists")}</a><a href={roleFilter ? path("/roles/strategists") : "#strategists"}>{tx("Strategists")}</a>
        </nav>
        <a className="language-switch" href={locale === "es" ? "/" : "/es"} hrefLang={locale === "es" ? "en" : "es"}>{locale === "es" ? "EN" : "ES"}</a>
        <div className="header-stats header-rank-only" style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties} aria-label={`${tx(selectedRank)} rank filter selected`}>
          <img src={selectedRank === "All Ranks" ? "/rivals-icon.ico" : rankImages[selectedRank]} alt="" />
          <div><span>{tx(selectedRank).toUpperCase()}</span></div>
        </div>
      </header>

      <a className={`mobile-top-arrow ${showMobileSearch ? "is-visible" : ""}`} href="#top" aria-label="Back to top">↑</a>

      <section className="hero-intro hero-intro-simple">
        <div>
          <p className="eyebrow">{tx("A MARVEL RIVALS COMMUNITY TOOL")}</p>
          <h1>{roleFilter ? <>{tx(roleFilter).toUpperCase()}<br /><span>{tx("META")}</span></> : <>{tx("CREATE THE")}<br /><span>{tx("META")}</span></>}</h1>
          <p className="intro-copy">{locale === "es" ? (roleFilter ? `Compara todos los Team-Ups de ${tx(roleFilter).toLowerCase()}, filtra los resultados por rango y plataforma, consulta los efectos mejorados y vota por tus habilidades favoritas.` : "Compara todos los Team-Ups de Marvel Rivals, filtra los votos de la comunidad por rango y plataforma, y descubre qué combinaciones de héroe ancla prefieren los jugadores.") : (roleFilter ? `Compare every ${roleFilter} Team-Up, filter results by competitive rank and platform, preview Enhanced effects, and vote for the abilities you trust.` : "Compare every Marvel Rivals teamup, filter community votes by rank and platform, and discover which anchor combinations players prefer.")}</p>
        </div>
        <div className="how-to-vote rank-insight" style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties}>
          <img className="rank-insight-icon" src={selectedRank === "All Ranks" ? "/rivals-icon.ico" : rankImages[selectedRank]} alt="" />
          <div><span>{tx("LIVE RANK INSIGHT")}</span><strong>{tx(selectedRank)}</strong></div>
          <p>{locale === "es" ? `Mostrando ${resultWindow === "recent" ? "los últimos 30 días" : "resultados históricos"} de ${tx(selectedEra.label)}, ${selectedRank === "All Ranks" ? "para toda la comunidad competitiva" : `de jugadores de rango ${tx(selectedRank)}`}.` : <>Showing {resultWindow === "recent" ? "the last 30 days" : "all-time results"} for {selectedEra.label}, from {selectedRank === "All Ranks" ? "the full ranked community" : `${selectedRank} players`}.</>}</p>
        </div>
      </section>

      {!roleFilter && <section className="daily-debate" aria-labelledby="daily-debate-title">
        <div className="daily-debate-hero"><img src={heroImage(featuredHero.id)} alt=""/><span><small>{locale === "es" ? "HÉROE MÁS RECIENTE" : "NEWEST HERO RELEASE"}</small><strong>{localizedHeroName(featuredHero)}</strong></span></div>
        <div className="daily-debate-copy"><p className="eyebrow">{locale === "es" ? "DESTACADO DEL META" : "META SPOTLIGHT"}</p><h2 id="daily-debate-title">{featuredDisplayA.name} <i>{locale === "es" ? "O" : "OR"}</i> {featuredDisplayB.name}?</h2><p>{locale === "es" ? `Ayuda a definir el meta del héroe más reciente. Resultados de ${selectedRank === "All Ranks" ? "todos los rangos" : selectedRank} en ${platform}.` : <>Help define the newest hero&apos;s meta. Results reflect {selectedRank === "All Ranks" ? "all competitive ranks" : selectedRank} on {platform}.</>}</p></div>
        <div className="daily-debate-score" aria-label={`Current result: ${featuredAbilityA.name} ${featuredPercentA} percent, ${featuredAbilityB.name} ${featuredPercentB} percent`}><div className={featuredPercentA > featuredPercentB ? "is-leading" : ""}><span><i className="debate-key debate-key-a"/>{featuredAbilityA.name}</span><strong>{featuredPercentA}%</strong></div><div className="daily-debate-track"><i className="debate-segment-a" style={{ width: `${featuredPercentA}%` }}/><i className="debate-segment-b" style={{ width: `${featuredPercentB}%` }}/></div><div className={featuredPercentB > featuredPercentA ? "is-leading" : ""}><span><i className="debate-key debate-key-b"/>{featuredAbilityB.name}</span><strong>{featuredPercentB}%</strong></div></div>
        <button className="is-featured-pulse" type="button" onClick={focusFeaturedHero}>{locale === "es" ? "VOTAR POR EL HÉROE MÁS RECIENTE" : "VOTE FOR THE NEWEST HERO"} <b>→</b></button>
      </section>}

      <section className="voting-progress" aria-label="Your voting progress">
        <div><span>{tx("YOUR VOTING PROGRESS")}</span><strong>{completedHeroes} / {directoryHeroes.length} {tx("HEROES")}</strong></div>
        <div className="progress-track" aria-hidden="true"><i style={{ width: `${progressPercent}%` }} /></div>
        <p>{locale === "es" ? (completedHeroes === directoryHeroes.length ? "Directorio completado. Regresa cuando terminen los tiempos de espera o llegue el próximo parche." : `Faltan ${directoryHeroes.length - completedHeroes} héroes para ayudar a definir el meta de la comunidad en este dispositivo.`) : (completedHeroes === directoryHeroes.length ? "Directory complete. Return after cooldowns or the next patch." : `${directoryHeroes.length - completedHeroes} heroes left to shape the community meta on this device.`)}</p>
      </section>

      <section className="control-deck" style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties} aria-label="Directory controls">
        <div className="platform-toggle" role="group" aria-label="Gaming platform"><span>{tx("PLATFORM DATA")}</span><button className={platform === "PC" ? "is-active" : ""} type="button" onClick={() => choosePlatform("PC")}>PC</button><button className={platform === "Console" ? "is-active" : ""} type="button" onClick={() => choosePlatform("Console")}>{locale === "es" ? "CONSOLA" : "CONSOLE"}</button></div>
        <div className="history-controls">
          <div><span>{tx("PATCH & SEASON HISTORY")}</span>{resultEras.map((era) => <button className={selectedEra.id === era.id ? "is-active" : ""} type="button" onClick={() => setSelectedEra(era)} key={era.id}>{tx(era.label)}</button>)}</div>
          <div><span>{tx("RESULT WINDOW")}</span><button className={resultWindow === "all" ? "is-active" : ""} type="button" onClick={() => setResultWindow("all")}>{tx("ALL-TIME")}</button><button className={resultWindow === "recent" ? "is-active" : ""} type="button" onClick={() => setResultWindow("recent")}>{tx("LAST 30 DAYS")}</button></div>
        </div>
        <div className="hero-search">
          <label htmlFor="hero-search">{tx("SEARCH HERO")}</label>
          <div className="search-input-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              id="hero-search"
              type="search"
              value={query}
              placeholder={tx("Search for a hero…")}
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
                  <strong>{localizedHeroName(hero)}</strong><small><img src={roleImage(hero.role)} alt="" />{tx(hero.role)}</small>
                </button>
              )) : <p>No heroes match “{query}”</p>}
            </div>
          )}
        </div>

        <div className="rank-filter">
          <div className="rank-filter-heading"><span>{tx("FILTER COMMUNITY BY RANK")}</span><strong>{tx(selectedRank)}</strong></div>
          <div className="rank-scale" role="group" aria-label="Community rank filter">
            {rankFilters.map((rank, index) => (
              <button className={selectedRank === rank ? "is-active" : ""} type="button" onClick={() => setSelectedRank(rank)} key={rank}>
                {rank === "All Ranks" ? <img className="all-ranks-icon" src="/rivals-icon.ico" alt="Marvel Rivals" /> : <img src={rankImages[rank]} alt="" />}
                <i>{index === 0 ? "00" : String(index).padStart(2, "0")}</i><span>{tx(rank)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="directory" aria-label="Hero Team-Up directory">
        {visibleRoles.map((role) => {
          const heroes = heroData.heroes.filter((hero) => hero.role === role).sort((a, b) => a.name.localeCompare(b.name));
          const meta = roleMeta[role];
          return (
            <section className={`role-section role-${role.toLowerCase()}`} id={meta.anchor} key={role}>
              <button className="role-banner role-collapse-button" type="button" aria-expanded={!collapsedRoles[role]} aria-label={`${collapsedRoles[role] ? tx("EXPAND") : tx("COLLAPSE")} ${tx(role)} ${tx("HEROES").toLowerCase()}`} onClick={() => setCollapsedRoles((current) => ({ ...current, [role]: !current[role] }))}>
                <span className="role-symbol"><img src={roleImage(role)} alt="" /></span>
                <div><h2>{tx(role)} {tx("HEROES").toLowerCase()}</h2><p>{meta.label} · {heroes.length} {locale === "es" ? "operativos" : "operatives"}</p></div>
                <span className="role-toggle-indicator" aria-hidden="true">
                  <span className="role-toggle-copy"><small>{locale === "es" ? "TOCA PARA" : "TAP TO"}</small><strong>{collapsedRoles[role] ? tx("EXPAND") : tx("COLLAPSE")}</strong></span>
                  <b>{collapsedRoles[role] ? "+" : "−"}</b>
                </span>
              </button>
              {!collapsedRoles[role] && <div className="hero-panels">
                {heroes.map((hero) => {
                  const enhanced = Boolean(enhancedHeroes[hero.id]);
                  const counts = hero.teamUpAbilities.map((ability) => abilityCount(hero, ability));
                  const heroTotal = counts[0] + counts[1];
                  return (
                    <article className={`hero-panel ${enhanced ? "hero-enhanced" : ""}`} id={`hero-${hero.id}`} key={hero.id}>
                      <div className="hero-panel-header">
                        <a className="hero-profile-link" href={path(`/heroes/${hero.id}`)} aria-label={`View ${hero.name} details`}>
                          <span className={`hero-avatar ${enhanced ? "is-lord" : ""}`} aria-hidden="true"><img src={enhanced ? lordImage(hero.id) : heroImage(hero.id)} alt="" /></span>
                          <span className="hero-identity"><strong>{localizedHeroName(hero)}</strong>{season10UpdatedHeroIds.has(hero.id) && <span className="season-update-badge">S10 UPDATED</span>}<span className="hero-details-link">{tx("VIEW DETAILS")} →</span></span>
                        </a>
                        <button className={`hero-toggle ${enhanced ? "is-on" : ""} ${showEnhancedDiscovery && (roleDiscoveryHeroIds.has(hero.id) || hero.id === featuredHero.id) ? "is-discoverable" : ""}`} type="button" role="switch" aria-checked={enhanced} aria-label={`Enhanced descriptions for ${localizedHeroName(hero)}`} onClick={() => toggleEnhanced(hero.id)}>
                          <span className="hero-toggle-track"><span /></span><b>{enhanced ? `⚡ ${tx("ENHANCED ON")}` : tx("ENHANCED OFF")}</b>
                        </button>
                        {showEnhancedDiscovery && (roleDiscoveryHeroIds.has(hero.id) || hero.id === featuredHero.id) && <span className="enhanced-tap-cue">{locale === "es" ? "TOCA PARA VER EL BONUS" : "TAP TO PREVIEW"} <b>⚡</b></span>}
                      </div>
                      <div className="ability-divider"><span>{tx("CHOOSE THE BETTER TEAM-UP")}</span></div>
                      <div className="panel-abilities">
                        {hero.teamUpAbilities.map((ability, abilityIndex) => {
                          const displayAbility = localizedAbility(ability);
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
                              {count > otherCount && <span className="community-choice">◎ {tx("COMMUNITY CHOICE")}</span>}
                              <div className="compact-topline"><span className={`ability-glyph ${enhanced ? "is-lord" : ""}`}><img src={anchorImage(ability.anchorPartner, enhanced)} alt={`${ability.anchorPartner} portrait`} /></span><span className="ability-name">{displayAbility.name}</span><strong className="vote-percent">{percentage}%</strong></div>
                              <span className="anchor-chip">{locale === "es" ? "ANCLA" : "ANCHOR"} · {displayAbility.anchorPartner}</span>
                              <p className="compact-description">{displayAbility.baseDescription}</p>
                              {enhanced && <p className="enhanced-addon"><strong>⚡ {locale === "es" ? "MEJORADO:" : "ENHANCED:"}</strong> {displayAbility.enhancedDescription}</p>}
                              <span className="card-vote-label"><span>{tx("VOTE FOR")} {displayAbility.anchorPartner.toUpperCase()} TEAM-UP</span><b>+</b></span>
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

      {roleFilter && <section className={`role-editorial role-editorial-${roleFilter.toLowerCase()}`} aria-labelledby="role-editorial-title">
        <p className="eyebrow">{locale === "es" ? "GUÍA EDITORIAL DEL ROL" : "ROLE EDITORIAL GUIDE"}</p>
        <h2 id="role-editorial-title">{roleEditorial[roleFilter][locale].title}</h2>
        <div>{roleEditorial[roleFilter][locale].paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>}

      {!roleFilter && <section className="teamups-explainer" aria-labelledby="teamups-explainer-title">
        <p className="eyebrow">{locale === "es" ? "CÓMO FUNCIONA" : "HOW IT WORKS"}</p>
        <h2 id="teamups-explainer-title">{locale === "es" ? "Compara, filtra y aporta tu voto" : "Compare, filter, and add your vote"}</h2>
        <div>
          <article><span>01</span><h3>{locale === "es" ? "Elige un héroe" : "Choose a hero"}</h3><p>{locale === "es" ? "Abre cualquier héroe para comparar sus dos habilidades, aliados ancla y efectos potenciados." : "Open any hero to compare both abilities, anchor partners, and Enhanced effects."}</p></article>
          <article><span>02</span><h3>{locale === "es" ? "Filtra la comunidad" : "Filter the community"}</h3><p>{locale === "es" ? "Selecciona rango y plataforma para observar preferencias de grupos comparables de jugadores." : "Select a rank and platform to see preferences from comparable groups of players."}</p></article>
          <article><span>03</span><h3>{locale === "es" ? "Vota y añade contexto" : "Vote and add context"}</h3><p>{locale === "es" ? "Elige el Team-Up que prefieres y explica cuándo funciona para ayudar a otros jugadores." : "Choose the Team-Up you prefer and explain when it works to help other players."}</p></article>
        </div>
        <p className="methodology-link">{locale === "es" ? "Los porcentajes son preferencias de visitantes, no estadísticas oficiales." : "Percentages are visitor preferences, not official game statistics."} <a href={path("/about")}>{locale === "es" ? "Lee la metodología completa →" : "Read the full methodology →"}</a></p>
      </section>}

      <aside className="clarity-disclosure">
        <p>{locale === "es" ? "Usamos Microsoft Clarity para comprender cómo utilizas el sitio mediante métricas de comportamiento, mapas de calor y repeticiones de sesión, con el fin de mejorar la experiencia, el rendimiento y la promoción del sitio. Al utilizar este sitio, aceptas que nosotros y Microsoft podamos recopilar y utilizar estos datos." : "We use Microsoft Clarity to understand how you use the site through behavioral metrics, heatmaps, and session replay so we can improve the experience, performance, and promotion of the site. By using this site, you agree that we and Microsoft may collect and use this data."} <a href="/privacy-policy">{locale === "es" ? "Consulta nuestra Política de Privacidad." : "See our Privacy Policy for details."}</a></p>
      </aside>
      <footer><span>RIVALS TEAM-UPS // {platform.toUpperCase()} {tx("COMMUNITY META")}</span><nav className="legal-links"><a href={path("/roles/vanguards")}>{tx("Vanguards").toUpperCase()}</a><a href={path("/roles/duelists")}>{tx("Duelists").toUpperCase()}</a><a href={path("/roles/strategists")}>{tx("Strategists").toUpperCase()}</a><a href="/patches">{tx("PATCHES")}</a><a href={path("/about")}>{locale === "es" ? "ACERCA DE Y METODOLOGÍA" : "ABOUT & METHODOLOGY"}</a><a href="/contact">{tx("CONTACT")}</a><a href="/legal-notice">{tx("LEGAL")}</a><a href="/privacy-policy">{tx("PRIVACY")}</a><a href="/terms-of-use">{tx("TERMS")}</a><a href="/cookie-policy">{tx("COOKIES")}</a></nav><a href="#top">{tx("BACK TO TOP")} ↑</a></footer>

      {pendingVote && (
        <div className="vote-modal-backdrop" role="presentation" onMouseDown={() => setPendingVote(null)}>
          <section className="vote-modal" role="dialog" aria-modal="true" aria-labelledby="vote-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setPendingVote(null)} aria-label="Close vote dialog">×</button>
            {voteCelebrating ? <div className="vote-counted-animation" role="status" aria-live="polite">
              <span className="vote-counted-ring"><b>✓</b></span>
              <p className="eyebrow">{tx("VOTE LOCKED IN")}</p>
              <h2 id="vote-modal-title">{tx("Vote counted")}</h2>
              <p>{locale === "es" ? "Actualizando el meta de la comunidad..." : "Updating the community meta..."}</p>
            </div> : voteStatus === "Vote recorded. Thank you!" ? <>
              <p className="eyebrow">{tx("VOTE RECORDED")}</p>
              <h2 id="vote-modal-title">{locale === "es" ? "¿Quieres añadir contexto?" : "Give more context?"}</h2>
              <p>{locale === "es" ? `¿Quieres explicar por qué elegiste ${localizedAbility(pendingVote.ability).name}? Tu opinión ayuda a otros jugadores a comprender el voto de la comunidad.` : <>Would you like to explain why you chose {pendingVote.ability.name}? Your Insight helps other players understand the community vote.</>}</p>
              <div className="vote-summary"><span>{localizedHeroName(pendingVote.hero)}</span><strong>{localizedAbility(pendingVote.ability).name}</strong><small>{localizedAbility(pendingVote.ability).anchorPartner} TEAM-UP</small></div>
              <div className="post-vote-actions">
                <a className="post-vote-insight" href={`${path(`/heroes/${pendingVote.hero.id}`)}?rank=${encodeURIComponent(voteRank)}&platform=${encodeURIComponent(votePlatform)}#hero-insights`}><strong>{locale === "es" ? "EXPLICAR MI VOTO" : "GIVE CONTEXT TO MY VOTE"}</strong><span>{locale === "es" ? `Abre las opiniones de ${localizedHeroName(pendingVote.hero)}.` : `Open ${pendingVote.hero.name}’s Insights section.`}</span><b>→</b></a>
                <button className="share-result-button" type="button" onClick={() => void shareVoteResult()}><strong>{locale === "es" ? "COMPARTIR RESULTADO" : "SHARE RESULT CARD"}</strong><span>{shareStatus || (locale === "es" ? "Crea una imagen e invita a otros a votar." : "Create an image and invite more votes.")}</span><b>↗</b></button>
                <button className="vote-more-button" type="button" onClick={() => setPendingVote(null)}>{locale === "es" ? "SEGUIR VOTANDO" : "VOTE MORE"}</button>
              </div>
            </> : <>
              <p className="eyebrow">{tx("ONE LAST STEP")}</p>
              <h2 id="vote-modal-title">{tx("What rank are you?")}</h2>
              <p>{locale === "es" ? "Tu rango permite comparar qué Team-Ups prefieren los jugadores de cada nivel competitivo." : "Your rank lets the community compare which Team-Ups different skill tiers prefer."}</p>
              <div className="vote-summary"><span>{localizedHeroName(pendingVote.hero)}</span><strong>{localizedAbility(pendingVote.ability).name}</strong><small>{localizedAbility(pendingVote.ability).anchorPartner} TEAM-UP</small></div>
              <div className="modal-ranks">
                {RANKS.map((rank, index) => <button className={voteRank === rank ? "is-active" : ""} type="button" onClick={() => { setVoteRank(rank); setVoteStatus(""); }} key={rank}><img src={rankImages[rank]} alt="" /><i>{String(index + 1).padStart(2, "0")}</i><span>{tx(rank)}</span></button>)}
              </div>
              <div className="modal-platforms" role="group" aria-label={locale === "es" ? "Selecciona tu plataforma" : "Select voting platform"}><span>{tx("YOUR PLATFORM")}</span><button className={votePlatform === "PC" ? "is-active" : ""} type="button" onClick={() => { setVotePlatform("PC"); setVoteStatus(""); }}>PC</button><button className={votePlatform === "Console" ? "is-active" : ""} type="button" onClick={() => { setVotePlatform("Console"); setVoteStatus(""); }}>{locale === "es" ? "CONSOLA" : "CONSOLE"}</button></div>
              {voteStatus && <p className="vote-status" aria-live="polite">{voteStatus}</p>}
              <button className="submit-vote" type="button" onClick={() => void submitVote()} disabled={!voteRank || !votePlatform}>{tx("RECORD MY VOTE")} <b>→</b></button>
            </>}
            <small className="privacy-note">{locale === "es" ? "Tu voto utiliza un identificador aleatorio del dispositivo. No se recopila ningún nombre ni cuenta." : "Your vote uses a random device ID. No name or account is collected."}</small>
          </section>
        </div>
      )}
    </main>
  );
}
