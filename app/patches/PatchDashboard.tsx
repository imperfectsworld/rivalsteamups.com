"use client";

import { useEffect, useMemo, useState } from "react";
import heroesJson from "@/src/data/heroes.json";
import type { HeroesData } from "@/src/types";

type Platform = "PC" | "Console";
type Window = "all" | "recent";
type VoteRow = { abilityId: string; rank: string; total: number };
type Totals = Record<string, number>;
type ResultRow = ReturnType<typeof buildRows>[number];

const heroes = (heroesJson as HeroesData).heroes;
const era = { season: "Season 10", patch: "S10 Launch", label: "S10 · CUMULATIVE" } as const;

function collapse(rows: VoteRow[]) {
  return rows.reduce<Totals>((all, row) => ({ ...all, [row.abilityId]: (all[row.abilityId] ?? 0) + row.total }), {});
}

function buildRows(votes: Totals) {
  return heroes.map((hero) => {
    const [first, second] = hero.teamUpAbilities;
    const firstVotes = votes[first.id] ?? 0;
    const secondVotes = votes[second.id] ?? 0;
    const total = firstVotes + secondVotes;
    const leader = firstVotes >= secondVotes ? first : second;
    const leaderVotes = Math.max(firstVotes, secondVotes);
    return { hero, leader, percent: total ? Math.round((leaderVotes / total) * 100) : 0, total, margin: Math.abs(firstVotes - secondVotes) };
  }).sort((a, b) => b.total - a.total || b.margin - a.margin);
}

function strongestConsensus(rows: ResultRow[]) {
  return rows.filter((row) => row.total >= 10).sort((a, b) => b.percent - a.percent || b.total - a.total)[0];
}

function closestRace(rows: ResultRow[]) {
  return rows.filter((row) => row.total >= 10).sort((a, b) => Math.abs(a.percent - 50) - Math.abs(b.percent - 50) || b.total - a.total)[0];
}

export default function PatchDashboard({ initialPcVotes, initialConsoleVotes }: { initialPcVotes: VoteRow[]; initialConsoleVotes: VoteRow[] }) {
  const initialPc = useMemo(() => collapse(initialPcVotes), [initialPcVotes]);
  const initialConsole = useMemo(() => collapse(initialConsoleVotes), [initialConsoleVotes]);
  const [platform, setPlatform] = useState<Platform>("PC");
  const [window, setWindow] = useState<Window>("all");
  const [current, setCurrent] = useState<Totals>(initialPc);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window === "all") {
      setCurrent(platform === "PC" ? initialPc : initialConsole);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ season: era.season, patch: era.patch, window, platform });
    fetch(`/api/votes?${params}`, { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as { votes: VoteRow[] } : { votes: [] })
      .then((data) => setCurrent(collapse(data.votes)))
      .finally(() => setLoading(false));
  }, [platform, window, initialPc, initialConsole]);

  const rows = useMemo(() => buildRows(current), [current]);
  const pcRows = useMemo(() => buildRows(initialPc), [initialPc]);
  const consoleRows = useMemo(() => buildRows(initialConsole), [initialConsole]);
  const totalVotes = rows.reduce((sum, row) => sum + row.total, 0);
  const active = rows.filter((row) => row.total > 0);
  const closeRaces = active.filter((row) => row.percent <= 55).length;
  const decisive = active.filter((row) => row.percent >= 65).length;
  const strongest = strongestConsensus(pcRows);
  const closest = closestRace(pcRows);
  const platformSplit = heroes.map((hero) => {
    const pc = pcRows.find((row) => row.hero.id === hero.id)!;
    const console = consoleRows.find((row) => row.hero.id === hero.id)!;
    const pcFirst = initialPc[hero.teamUpAbilities[0].id] ?? 0;
    const consoleFirst = initialConsole[hero.teamUpAbilities[0].id] ?? 0;
    const pcShare = pc.total ? Math.round((pcFirst / pc.total) * 100) : 0;
    const consoleShare = console.total ? Math.round((consoleFirst / console.total) * 100) : 0;
    return { hero, pc, console, gap: pc.total >= 10 && console.total >= 10 ? Math.abs(pcShare - consoleShare) : -1 };
  }).filter((row) => row.gap >= 0).sort((a, b) => b.gap - a.gap)[0];

  return <main className="legal-shell patch-shell">
    <header className="topbar detail-topbar"><a className="brand" href="/"><span className="brand-mark">R</span><span><strong>RIVALS</strong><small>TEAM-UP</small></span></a><nav className="role-nav"><a href="/roles/vanguards">Vanguards</a><a href="/roles/duelists">Duelists</a><a href="/roles/strategists">Strategists</a></nav><a className="detail-back" href="/">← DIRECTORY</a></header>
    <section className="patch-hero"><p className="eyebrow">LIVE PATCH INTELLIGENCE</p><h1>TEAM-UP<br/><span>SHIFT REPORT</span></h1><p>Track the community meta without mixing votes from different balance eras. Compare current leaders, identify contested Team-Ups, and see when preferences move after an update.</p><small>REVIEWED SEPTEMBER 17, 2026 · EDITED BY DEANGELO ROBINSON</small></section>
    <section className="patch-controls"><div><span>PLATFORM</span><button className={platform === "PC" ? "is-active" : ""} onClick={() => setPlatform("PC")}>PC</button><button className={platform === "Console" ? "is-active" : ""} onClick={() => setPlatform("Console")}>CONSOLE</button></div><div><span>RESULT WINDOW</span><button className={window === "all" ? "is-active" : ""} onClick={() => setWindow("all")}>ALL-TIME</button><button className={window === "recent" ? "is-active" : ""} onClick={() => setWindow("recent")}>LAST 30 DAYS</button></div></section>
    <section className="patch-stat-grid"><article><span>RECORDED VOTES</span><strong>{totalVotes.toLocaleString()}</strong><p>{era.label} · {platform}</p></article><article><span>ACTIVE HERO RACES</span><strong>{active.length}</strong><p>Heroes with recorded votes</p></article><article><span>CLOSE RACES</span><strong>{closeRaces}</strong><p>Leader at 55% or less</p></article><article><span>DECISIVE LEADERS</span><strong>{decisive}</strong><p>Leader at 65% or more</p></article></section>

    <section className="patch-editorial" aria-labelledby="season-brief-title">
      <header><div><p className="eyebrow">ORIGINAL COMMUNITY DATA</p><h2 id="season-brief-title">SEASON 10 DATA BRIEF</h2></div><p>This editorial snapshot is calculated from votes submitted directly on Rivals Team-Ups. It is descriptive community research—not official pick-rate or win-rate data.</p></header>
      <div className="patch-brief-grid">
        <article><span>STRONGEST PC CONSENSUS</span><h3>{strongest?.hero.name ?? "Awaiting a larger sample"}</h3>{strongest && <><strong>{strongest.leader.name} · {strongest.percent}%</strong><p>{strongest.total.toLocaleString()} PC votes. A high share indicates agreement among this site&apos;s voters, not guaranteed competitive strength.</p></>}</article>
        <article><span>MOST CONTESTED PC CHOICE</span><h3>{closest?.hero.name ?? "Awaiting a larger sample"}</h3>{closest && <><strong>{closest.hero.teamUpAbilities[0].name} vs. {closest.hero.teamUpAbilities[1].name}</strong><p>The leader holds {closest.percent}% of {closest.total.toLocaleString()} PC votes, making team composition especially important.</p></>}</article>
        <article><span>LARGEST PLATFORM DIFFERENCE</span><h3>{platformSplit?.hero.name ?? "Awaiting larger samples"}</h3>{platformSplit && <><strong>{platformSplit.gap} percentage-point gap</strong><p>PC currently favors {platformSplit.pc.leader.name}; console favors {platformSplit.console.leader.name}. Based on {platformSplit.pc.total.toLocaleString()} PC and {platformSplit.console.total.toLocaleString()} console votes.</p></>}</article>
      </div>
      <p className="patch-brief-note">Every result includes its sample size. Filters with fewer than 10 votes should be treated as early signals. <a href="/about">Read the voting methodology and editorial standards →</a></p>
    </section>

    <section className="patch-report"><div className="patch-report-heading"><div><p className="eyebrow">CURRENT CONSENSUS</p><h2>{era.label} TEAM-UP LEADERS</h2></div><p>{loading ? "Loading live community results…" : `${platform} · ${window === "recent" ? "last 30 days" : "all-time"}`}</p></div><div className="patch-table">{rows.map(({ hero, leader, percent, total, margin }) => <a href={`/heroes/${hero.id}`} key={hero.id}><img src={`/heroes/${hero.id}.webp`} alt=""/><div><span>{hero.role}</span><strong>{hero.name}</strong><small>{leader.name} · {leader.anchorPartner}</small></div><div className="patch-result"><strong>{total ? `${percent}%` : "—"}</strong><span>{total.toLocaleString()} VOTES</span></div><div className="patch-signal">{total === 0 ? "AWAITING DATA" : margin <= Math.max(2, total * .1) ? "CLOSE RACE" : percent >= 65 ? "STRONG CONSENSUS" : "CURRENT LEADER"}</div></a>)}</div></section>
    <section className="patch-method"><h2>HOW VOTE HISTORY WORKS</h2><div><article><span>01</span><h3>Season 10 is cumulative</h3><p>Season 10 began with the site&apos;s S9 and S9.5 voting baseline. New votes continue adding to that combined community sample.</p></article><article><span>02</span><h3>Recent results reveal momentum</h3><p>Use the 30-day view to isolate newer votes and spot developing preferences within the cumulative results.</p></article><article><span>03</span><h3>Platforms stay separate</h3><p>PC and console voting can be compared independently because play patterns may influence Team-Up preference.</p></article></div></section>
    <footer className="detail-legal-footer"><span>RIVALS TEAM-UPS // PATCH INTELLIGENCE</span><nav className="legal-links"><a href="/about">ABOUT & METHODOLOGY</a><a href="/contact">CONTACT</a><a href="/legal-notice">LEGAL NOTICE</a><a href="/privacy-policy">PRIVACY</a><a href="/terms-of-use">TERMS</a><a href="/cookie-policy">COOKIES</a></nav><a href="/">DIRECTORY ↑</a></footer>
  </main>;
}
