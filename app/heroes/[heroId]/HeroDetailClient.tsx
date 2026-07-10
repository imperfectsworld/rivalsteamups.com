"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import heroesJson from "@/src/data/heroes.json";
import rankVotesJson from "@/src/data/rankVotes.json";
import { RANKS, type Hero, type HeroesData, type PlayerRank, type TeamUpSlot } from "@/src/types";

type LiveVotes = Record<string, Record<string, number>>;
type DetailRank = "All Ranks" | PlayerRank;
type Insight = { id: number; displayName: string; rank: string | null; patch: string; body: string; createdAt: string; score: number; flags: number };
const heroData = heroesJson as HeroesData;
const seededRankVotes = rankVotesJson as Record<string, Record<TeamUpSlot, number[]>>;
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
  "All Ranks": "#b8f34a", Bronze: "#c98b61", Silver: "#b8d5df", Gold: "#f2b431", Platinum: "#43e7df", Diamond: "#77adf3", Grandmaster: "#7b42ff", Celestial: "#ff7a1f", Eternity: "#f022ff", "One Above All": "#ff3023",
};

function seededCount(heroId: string, slot: TeamUpSlot, rank: PlayerRank) {
  const configuredValues = seededRankVotes[heroId]?.[slot];
  const heroSeed = [...heroId].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const values = configuredValues ?? RANKS.map((_, rankIndex) =>
    8 + ((heroSeed + rankIndex * 7 + (slot === "A" ? 11 : 23)) % 24),
  );
  return values[RANKS.indexOf(rank)] ?? 0;
}

export default function HeroDetailClient({ hero }: { hero: Hero }) {
  const [liveVotes, setLiveVotes] = useState<LiveVotes>({});
  const [selectedRank, setSelectedRank] = useState<DetailRank>("All Ranks");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightName, setInsightName] = useState("");
  const [insightRank, setInsightRank] = useState<PlayerRank | "">("");
  const [insightBody, setInsightBody] = useState("");
  const [insightStatus, setInsightStatus] = useState("");

  const loadVotes = useCallback(async () => {
    try {
      const response = await fetch("/api/votes", { cache: "no-store" });
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
  }, []);

  useEffect(() => { void loadVotes(); }, [loadVotes]);

  const loadInsights = useCallback(async () => {
    try {
      const response = await fetch(`/api/insights?heroId=${encodeURIComponent(hero.id)}`, { cache: "no-store" });
      const data = await response.json() as { insights?: Insight[] };
      if (response.ok) setInsights(data.insights ?? []);
    } catch { setInsights([]); }
  }, [hero.id]);

  useEffect(() => { void loadInsights(); }, [loadInsights]);

  function voterId() {
    let id = localStorage.getItem("rivals-voter-id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("rivals-voter-id", id); }
    return id;
  }

  async function submitInsight() {
    setInsightStatus("Posting…");
    const response = await fetch("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", heroId: hero.id, voterId: voterId(), displayName: insightName, rank: insightRank, body: insightBody }) });
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
      seededCount(hero.id, ability.slot, rank) + (liveVotes[rank]?.[ability.id] ?? 0),
    ) as [number, number];
    const total = counts[0] + counts[1];
    return { rank, counts, total, percentages: counts.map((count) => total ? Math.round((count / total) * 100) : 50) as [number, number] };
  }), [hero, liveVotes]);

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
      <header className="detail-topbar">
        <a href="/" className="detail-brand"><span>R</span><strong>RIVALS TEAM-UP META</strong></a>
        <a href={`/#hero-${hero.id}`} className="detail-back">← BACK TO DIRECTORY</a>
      </header>

      <section className="detail-hero">
        <div className="detail-copy">
          <p className="eyebrow">SEASON 09 · HERO INTELLIGENCE</p>
          <div className="detail-role"><img src={`/roles/${hero.role.toLowerCase()}.webp`} alt="" />{hero.role}</div>
          <h1>{hero.name}</h1>
          <p>Rank-by-rank community voting, total preference, and Team-Up momentum for {hero.name}.</p>
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
        <div className="detail-section-heading"><div><span>01</span><h2>Team-Up totals</h2></div><p>Showing {selectedRank === "All Ranks" ? "all ranks" : selectedRank}.</p></div>
        <div className="detail-teamups">
          {hero.teamUpAbilities.map((ability, index) => {
            const anchor = heroByName.get(ability.anchorPartner.toLowerCase());
            const percentage = totalVotes ? Math.round((totals[index] / totalVotes) * 100) : 50;
            return <article className={index === leaderIndex ? "is-leader" : ""} key={ability.id}>
              {index === leaderIndex && <b className="detail-choice-badge">COMMUNITY CHOICE</b>}
              <div className="detail-anchor"><img src={anchor ? `/heroes/${anchor.id}.webp` : "/heroes/hulk.webp"} alt="" /><span><small>ANCHOR</small><strong>{ability.anchorPartner}</strong></span><em>{percentage}%</em></div>
              <h3>{ability.name}</h3><p>{ability.baseDescription}</p>
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

        <div className="detail-section-heading"><div><span>02</span><h2>Detailed rank breakdown</h2></div><p>See how preference changes as the competitive tier rises.</p></div>
        <div className="rank-breakdown">
          {rows.map((row) => <article key={row.rank}>
            <div className="breakdown-rank"><img src={rankImages[row.rank]} alt="" /><span><strong>{row.rank}</strong><small>{row.total.toLocaleString()} votes</small></span></div>
            <div className="breakdown-bars">
              {hero.teamUpAbilities.map((ability, index) => <div key={ability.id}><span><b>{ability.name} ({ability.anchorPartner})</b><em>{row.counts[index]} · {row.percentages[index]}%</em></span><i><b style={{ width: `${row.percentages[index]}%` }} /></i></div>)}
            </div>
          </article>)}
        </div>

        <section className="insights-section" id="hero-insights">
          <div className="detail-section-heading"><div><span>03</span><h2>Community insights</h2></div><p>Ranked context from players behind the votes.</p></div>
          <div className="insight-composer">
            <div><label>DISPLAY NAME <input value={insightName} maxLength={32} placeholder="Anonymous" onChange={(event) => setInsightName(event.target.value)} /></label><label>YOUR RANK <select value={insightRank} onChange={(event) => setInsightRank(event.target.value as PlayerRank | "")}><option value="">Not selected</option>{RANKS.map((rank) => <option value={rank} key={rank}>{rank}</option>)}</select></label></div>
            <label>YOUR INSIGHT <textarea value={insightBody} maxLength={800} placeholder="Why do you prefer one Team-Up? Share useful matchup, composition, or rank-specific context…" onChange={(event) => setInsightBody(event.target.value)} /></label>
            <button type="button" disabled={insightBody.trim().length < 8} onClick={() => void submitInsight()}>POST INSIGHT →</button>
            {insightStatus && <p className="insight-status" aria-live="polite">{insightStatus}</p>}
          </div>
          <div className="insight-list">
            {insights.length ? insights.map((insight) => <article key={insight.id}>
              <header><strong>{insight.displayName}</strong><span>{insight.rank || "Unranked"} · {insight.patch}</span></header>
              <p>{insight.body}</p>
              <footer><button type="button" onClick={() => void reactToInsight(insight.id, "react", 1)}>▲ UPVOTE</button><b>{insight.score}</b><button type="button" onClick={() => void reactToInsight(insight.id, "react", -1)}>▼ DOWNVOTE</button><button className="flag-insight" type="button" onClick={() => void reactToInsight(insight.id, "flag")}>FLAG</button></footer>
            </article>) : <p className="empty-insights">No insights yet. Be the first to explain your vote.</p>}
          </div>
        </section>

      </section>
    </main>
  );
}
