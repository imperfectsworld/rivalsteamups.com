import type { Metadata } from "next";
import { LegalPage } from "@/app/legal-page";

export const metadata: Metadata = {
  title: "About Rivals Team-Ups & Voting Methodology",
  description: "Learn who runs Rivals Team-Ups, how community votes are collected, and how Team-Up results and editorial analysis should be interpreted.",
  alternates: { canonical: "/about", languages: { en: "/about", es: "/es/about" } },
};

export default function AboutPage() {
  return <LegalPage eyebrow="ABOUT THE PROJECT" title="About & Methodology" updatedLabel="Last reviewed October 8, 2026">
    <p>Rivals Team-Ups is an independent Marvel Rivals community project created and maintained by DeAngelo Robinson. It was built to help players compare competing Team-Up abilities, see how preferences change across ranks and platforms, and add their own experience to the discussion. The project is not affiliated with Marvel or NetEase Games.</p>
    <h2>What this project adds</h2>
    <p>The site is not a mirror of a game wiki. Its original service is a structured voting dataset that compares two Team-Up choices for every eligible hero, separates PC and console responses, breaks preferences down by competitive rank, and publishes player-written context alongside the totals. Every hero page also pairs the live results with a focused creator video so visitors can watch the mechanics before voting.</p>
    <h2>How community voting works</h2>
    <p>Each hero presents two Team-Up options. A visitor chooses one option and identifies their competitive rank and platform. Results can then be filtered by PC or console, competitive rank, and the available result window. A random device identifier is used to enforce one vote per hero within a 24-hour period. The site does not require an account or collect a voter&apos;s real name.</p>
    <h2>How to interpret the results</h2>
    <p>Vote percentages represent the preferences submitted by this site&apos;s visitors; they are not official pick rates, win rates, or balance statistics. Results with fewer than 10 votes are labeled as an early signal because a small number of new responses can substantially change the outcome. A view with no votes does not display an artificial 50/50 conclusion. Filters can also produce different results because the players included in each view are different.</p>
    <p>Season 10.5 uses the same cumulative community sample introduced for Season 10. Its opening totals include ballots collected during Seasons 9, 9.5, and 10, and every new Season 10.5 ballot is added to that baseline. The 30-day filter isolates recent participation without erasing the long-running community result.</p>
    <h2>Ability information and watch pages</h2>
    <p>Ability names and effect descriptions summarize in-game Team-Up information. Each hero page is designed as a dedicated watch page: its featured video is the primary content, followed by the live vote comparison, rank breakdown, and player-written insights for that same hero.</p>
    <h2>Editorial standards</h2>
    <p>In-game ability information is identified separately from community submissions. Every result shows the relevant sample size, and views below 10 votes are labeled as early signals. The site does not present community preferences as official pick rates, win rates, or developer balance statistics.</p>
    <p>Embedded creator videos are selected because they discuss the same hero and Team-Up decision shown on the page. They supplement the site&apos;s own voting and rank breakdowns; they do not replace them. No creator pays for placement or a favorable result.</p>
    <h2>Updates, corrections, and transparency</h2>
    <p>Hero and Team-Up information is reviewed when seasons and balance patches change. Community totals update as votes are recorded, and mechanics are revised when the game changes. The latest full review was completed for Season 10.5 on October 8, 2026. If you find inaccurate information or want to request a feature, email <a href="mailto:neckbearddev@gmail.com">neckbearddev@gmail.com</a>.</p>
    <h2>Publisher</h2>
    <p>DeAngelo Robinson is the developer and editor of Rivals Team-Ups. You can learn more about his work on <a href="https://www.linkedin.com/in/deangelo-robinson/" target="_blank" rel="noreferrer">LinkedIn</a> or follow site updates on <a href="https://x.com/NeckBeardDev" target="_blank" rel="noreferrer">X</a>.</p>
  </LegalPage>;
}
