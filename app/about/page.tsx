import type { Metadata } from "next";
import { LegalPage } from "@/app/legal-page";

export const metadata: Metadata = {
  title: "About Rivals Team-Ups & Voting Methodology",
  description: "Learn who runs Rivals Team-Ups, how community votes are collected, and how Team-Up results and editorial analysis should be interpreted.",
  alternates: { canonical: "/about", languages: { en: "/about", es: "/es/about" } },
};

export default function AboutPage() {
  return <LegalPage eyebrow="ABOUT THE PROJECT" title="About & Methodology" updatedLabel="Last reviewed September 10, 2026">
    <p>Rivals Team-Ups is an independent Marvel Rivals community project created and maintained by DeAngelo Robinson. It was built to help players compare competing Team-Up abilities, see how preferences change across ranks and platforms, and add their own experience to the discussion. The project is not affiliated with Marvel or NetEase Games.</p>
    <h2>How community voting works</h2>
    <p>Each hero presents two Team-Up options. A visitor chooses one option and identifies their competitive rank and platform. Results can then be filtered by PC or console, competitive rank, and the available result window. A random device identifier is used to enforce one vote per hero within a 24-hour period. The site does not require an account or collect a voter&apos;s real name.</p>
    <h2>How to interpret the results</h2>
    <p>Vote percentages represent the preferences submitted by this site&apos;s visitors; they are not official pick rates, win rates, or balance statistics. Results with fewer than 10 votes are labeled as an early signal because a small number of new responses can substantially change the outcome. A view with no votes does not display an artificial 50/50 conclusion. Filters can also produce different results because the players included in each view are different.</p>
    <p>Season 10 uses a cumulative community sample. Its opening totals include the ballots collected during Seasons 9 and 9.5, and every new Season 10 ballot is added to that baseline. Historical Season 9.5 results remain available separately for comparison; the 30-day filter isolates recent momentum.</p>
    <h2>Ability information and editorial analysis</h2>
    <p>Ability names and effect descriptions summarize in-game Team-Up information. Editorial analysis is published separately and considers the hero&apos;s role, the effect&apos;s practical conditions, composition requirements, positioning, and the current community sample. Community verdicts describe the vote data available at that moment and should not be treated as universal recommendations.</p>
    <h2>Updates, corrections, and transparency</h2>
    <p>Hero and Team-Up information is reviewed when seasons and balance patches change. Community totals update as votes are recorded, while editorial copy is revised when mechanics or conclusions materially change. If you find inaccurate or outdated information, email <a href="mailto:NeckBeardDev@gmail.com">NeckBeardDev@gmail.com</a>. Corrections, partnership questions, and constructive feedback are welcome.</p>
    <h2>Publisher</h2>
    <p>DeAngelo Robinson is the developer and editor of Rivals Team-Ups. You can learn more about his work on <a href="https://www.linkedin.com/in/deangelo-robinson/" target="_blank" rel="noreferrer">LinkedIn</a> or follow site updates on <a href="https://x.com/NeckBeardDev" target="_blank" rel="noreferrer">X</a>.</p>
  </LegalPage>;
}
