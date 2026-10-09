import type { Metadata } from "next";
import PatchDashboard from "./PatchDashboard";
import { getVoteRows } from "../vote-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Marvel Rivals Season 10.5 Team-Up Results", description: "Explore live Season 10.5 Marvel Rivals Team-Up vote totals and community leaders by platform.", alternates: { canonical: "/patches" } };
export default async function PatchesPage() {
  const [initialPcVotes, initialConsoleVotes] = await Promise.all([
    getVoteRows({ platform: "PC" }),
    getVoteRows({ platform: "Console" }),
  ]);
  return <PatchDashboard initialPcVotes={initialPcVotes} initialConsoleVotes={initialConsoleVotes} />;
}
