"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import heroesJson from "@/src/data/heroes.json";
import { RANKS, type Hero, type HeroesData, type PlayerRank } from "@/src/types";

type LiveVotes = Record<string, Record<string, number>>;
type DetailRank = "All Ranks" | PlayerRank;
type Platform = "PC" | "Console";
type Insight = { id: number; displayName: string; rank: string | null; patch: string; platform: Platform; body: string; createdAt: string; score: number; flags: number };
const heroData = heroesJson as HeroesData;
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

export default function HeroDetailClient({ hero }: { hero: Hero }) {
  const [liveVotes, setLiveVotes] = useState<LiveVotes>({});
  const [selectedRank, setSelectedRank] = useState<DetailRank>("All Ranks");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightName, setInsightName] = useState("");
  const [insightRank, setInsightRank] = useState<PlayerRank | "">("");
  const [insightBody, setInsightBody] = useState("");
  const [insightStatus, setInsightStatus] = useState("");
  const [enhanced, setEnhanced] = useState(false);
  const [platform, setPlatform] = useState<Platform>("PC");

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
  }, []);

  function choosePlatform(next: Platform) {
    setPlatform(next);
    localStorage.setItem("rivals-platform", next);
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

  async function submitInsight() {
    setInsightStatus("Posting…");
    const response = await fetch("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", heroId: hero.id, voterId: voterId(), displayName: insightName, rank: insightRank, platform, body: insightBody }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setInsightStatus(data.error || "Unable to post insight."); return; }
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
  const leader = hero.teamUpAbilities[leaderIndex];
  const leaderPercent = totalVotes ? Math.round((totals[leaderIndex] / totalVotes) * 100) : 50;
  const rolePeers = heroData.heroes.filter((candidate) => candidate.role === hero.role && candidate.id !== hero.id);
  const roleAnchor = `${hero.role.toLowerCase()}s`;
  const featuredInsight = insights[0];

  return (
    <main className={`detail-shell detail-${hero.role.toLowerCase()}`} style={{ "--rank-accent": rankColors[selectedRank] } as CSSProperties}>
      <header className="topbar detail-topbar">
        <a className="brand" href="/" aria-label="Rivals Team-Up Meta home">
          <span className="brand-mark">R</span>
          <span><strong>RIVALS</strong><small>TEAM-UP META</small></span>
        </a>
        <a href={`/#hero-${hero.id}`} className="detail-back">← BACK TO DIRECTORY</a>
      </header>

      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">SEASON 09 · HERO INTELLIGENCE</p>
          <div className="detail-role"><img src={`/roles/${hero.role.toLowerCase()}.webp`} alt="" />{hero.role}</div>
          <h1><img className="mobile-detail-hero-icon" src={`/heroes/${hero.id}.webp`} alt="" />{hero.name}</h1>
          <p>Compare {hero.name}&apos;s {hero.teamUpAbilities[0].name} Team-Up with {hero.teamUpAbilities[1].name}. Explore community preference by competitive rank and platform, review both anchor partners, and preview every Enhanced effect for Season 9.</p>
          <div className="detail-summary-grid">
            <div><span>TOTAL VOTES</span><strong>{totalVotes.toLocaleString()}</strong></div>
            <div><span>COMMUNITY LEADER</span><strong>{leader.name}</strong><small>{leaderPercent}% preference</small></div>
            <div><span>LEAD MARGIN</span><strong>{Math.abs(totals[0] - totals[1]).toLocaleString()}</strong><small>votes between options</small></div>
          </div>
          <div className="detail-rank-selector" role="group" aria-label="Filter hero totals by rank">
            <button className={selectedRank === "All Ranks" ? "is-active" : ""} type="button" onClick={() => setSelectedRank("All Ranks")}><img src="/rivals-icon.ico" alt="" /><span>All</span></button>
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
        <div className="platform-toggle detail-platform-toggle" role="group" aria-label="Gaming platform"><span>PLATFORM DATA</span><button className={platform === "PC" ? "is-active" : ""} type="button" onClick={() => choosePlatform("PC")}>PC</button><button className={platform === "Console" ? "is-active" : ""} type="button" onClick={() => choosePlatform("Console")}>CONSOLE</button></div>
        <div className="detail-section-heading teamup-heading"><div><h2>Team-Up totals</h2></div><div className="detail-teamup-tools"><p>Showing {selectedRank === "All Ranks" ? "all ranks" : selectedRank}.</p><button className={`hero-toggle ${enhanced ? "is-on" : ""}`} type="button" role="switch" aria-checked={enhanced} onClick={() => setEnhanced((current) => !current)}><span className="hero-toggle-track"><span /></span><b>{enhanced ? "⚡ ENHANCED ON" : "ENHANCED OFF"}</b></button></div></div>
        <div className="detail-teamups">
          {hero.teamUpAbilities.map((ability, index) => {
            const anchor = heroByName.get(ability.anchorPartner.toLowerCase());
            const percentage = totalVotes ? Math.round((totals[index] / totalVotes) * 100) : 50;
            return <article className={`${index === leaderIndex ? "is-leader" : ""} ${enhanced ? "is-enhanced" : ""}`} key={ability.id}>
              {index === leaderIndex && <b className="detail-choice-badge">COMMUNITY CHOICE</b>}
              <div className="detail-anchor"><img className={enhanced ? "is-animated" : ""} src={anchor ? `/${enhanced ? "lord-icons" : "heroes"}/${anchor.id}.webp` : `/${enhanced ? "lord-icons" : "heroes"}/hulk.webp`} alt="" /><span><small>ANCHOR</small><strong>{ability.anchorPartner}</strong></span><em>{percentage}%</em></div>
              <h3>{ability.name}</h3><p>{ability.baseDescription}</p>
              {enhanced && <p className="enhanced-addon"><strong>⚡ ENHANCED:</strong> {ability.enhancedDescription}</p>}
              <footer><span>{totals[index].toLocaleString()} votes</span><strong>{percentage}% of community</strong></footer>
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
            {rolePeers.map((peer) => <a href={`/heroes/${peer.id}`} key={peer.id} aria-label={`View ${peer.name} details`}>
              <img src={`/heroes/${peer.id}.webp`} alt="" />
              <span>{peer.name}</span>
            </a>)}
          </div>
          <a className="role-discovery-all" href={`/#${roleAnchor}`}>VIEW ALL {hero.role.toUpperCase()} HEROES <b>›</b></a>
        </aside>

        <div className="detail-section-heading"><div><h2>Detailed rank breakdown</h2></div><p>See how preference changes as the competitive tier rises.</p></div>
        <div className="rank-breakdown">
          {rows.map((row) => <article key={row.rank}>
            <div className="breakdown-rank"><img src={rankImages[row.rank]} alt="" /><span><strong>{row.rank}</strong><small>{row.total.toLocaleString()} votes</small></span></div>
            <div className="breakdown-bars">
              {hero.teamUpAbilities.map((ability, index) => <div key={ability.id}><span><b>{ability.name} ({ability.anchorPartner})</b><em>{row.counts[index]} · {row.percentages[index]}%</em></span><i><b style={{ width: `${row.percentages[index]}%` }} /></i></div>)}
            </div>
          </article>)}
        </div>

        <section className="insights-section" id="hero-insights">
          <div className="detail-section-heading"><div><h2>Community insights</h2></div><p>Ranked context from players behind the votes.</p></div>
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

      </section>
      <footer className="detail-legal-footer"><span>RIVALS TEAM-UPS // {platform.toUpperCase()} COMMUNITY META</span><nav className="legal-links"><a href="/legal-notice">LEGAL NOTICE</a><a href="/privacy-policy">PRIVACY</a><a href="/terms-of-use">TERMS</a><a href="/cookie-policy">COOKIES</a></nav><a href="/">DIRECTORY ↑</a></footer>
    </main>
  );
}
