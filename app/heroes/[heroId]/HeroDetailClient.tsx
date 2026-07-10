"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import heroesJson from "@/src/data/heroes.json";
import rankVotesJson from "@/src/data/rankVotes.json";
import { RANKS, type Hero, type HeroesData, type PlayerRank, type TeamUpSlot } from "@/src/types";

type LiveVotes = Record<string, Record<string, number>>;
const heroData = heroesJson as HeroesData;
const seededRankVotes = rankVotesJson as Record<string, Record<TeamUpSlot, number[]>>;
const heroByName = new Map(heroData.heroes.map((hero) => [hero.name.toLowerCase(), hero]));

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

  const rows = useMemo(() => RANKS.map((rank) => {
    const counts = hero.teamUpAbilities.map((ability) =>
      seededCount(hero.id, ability.slot, rank) + (liveVotes[rank]?.[ability.id] ?? 0),
    ) as [number, number];
    const total = counts[0] + counts[1];
    return { rank, counts, total, percentages: counts.map((count) => total ? Math.round((count / total) * 100) : 50) as [number, number] };
  }), [hero, liveVotes]);

  const totals = hero.teamUpAbilities.map((_, index) => rows.reduce((sum, row) => sum + row.counts[index], 0)) as [number, number];
  const totalVotes = totals[0] + totals[1];
  const leaderIndex = totals[1] > totals[0] ? 1 : 0;
  const leader = hero.teamUpAbilities[leaderIndex];
  const leaderPercent = totalVotes ? Math.round((totals[leaderIndex] / totalVotes) * 100) : 50;
  const rolePeers = heroData.heroes.filter((candidate) => candidate.role === hero.role && candidate.id !== hero.id);
  const roleAnchor = `${hero.role.toLowerCase()}s`;

  return (
    <main className={`detail-shell detail-${hero.role.toLowerCase()}`}>
      <header className="detail-topbar">
        <a href="/" className="detail-brand"><span>R</span><strong>RIVALS TEAM-UP MATRIX</strong></a>
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
        </div>
        <div className="detail-portrait"><img src={`/portraits/${hero.id}.webp`} alt={`${hero.name} full hero portrait`} /></div>
      </section>

      <section className="detail-content">
        <div className="detail-section-heading"><div><span>01</span><h2>Team-Up totals</h2></div><p>All ranks combined, including live community votes.</p></div>
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

        <div className="detail-section-heading"><div><span>02</span><h2>Detailed rank breakdown</h2></div><p>See how preference changes as the competitive tier rises.</p></div>
        <div className="rank-breakdown">
          {rows.map((row) => <article key={row.rank}>
            <div className="breakdown-rank"><img src={rankImages[row.rank]} alt="" /><span><strong>{row.rank}</strong><small>{row.total.toLocaleString()} votes</small></span></div>
            <div className="breakdown-bars">
              {hero.teamUpAbilities.map((ability, index) => <div key={ability.id}><span><b>{ability.name} ({ability.anchorPartner})</b><em>{row.counts[index]} · {row.percentages[index]}%</em></span><i><b style={{ width: `${row.percentages[index]}%` }} /></i></div>)}
            </div>
          </article>)}
        </div>

        <div className="detail-section-heading"><div><span>03</span><h2>Team-Up trend</h2></div><p>A quick view of which anchor gains ground at each rank.</p></div>
        <div className="trend-grid">
          {rows.map((row) => <div key={row.rank}><img src={rankImages[row.rank]} alt="" /><span className="trend-stack"><i style={{ height: `${row.percentages[0]}%` }} /><b style={{ height: `${row.percentages[1]}%` }} /></span><strong>{row.percentages[leaderIndex]}%</strong><small>{row.rank}</small></div>)}
        </div>
        <div className="trend-legend"><span><i />{hero.teamUpAbilities[0].anchorPartner}</span><span><i />{hero.teamUpAbilities[1].anchorPartner}</span></div>

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
      </section>
    </main>
  );
}
