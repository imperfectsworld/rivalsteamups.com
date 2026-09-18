import type { Metadata } from "next";
import PatchDashboard from "./PatchDashboard";
import { getVoteRows } from "../vote-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Marvel Rivals Season 10 Team-Up Patch Trends", description: "Compare live Marvel Rivals Team-Up leaders, close community races, platform differences, and preference shifts across patches.", alternates: { canonical: "/patches" } };
export default async function PatchesPage() {
  const [initialPcVotes, initialConsoleVotes] = await Promise.all([
    getVoteRows({ platform: "PC" }),
    getVoteRows({ platform: "Console" }),
  ]);
  return <PatchDashboard initialPcVotes={initialPcVotes} initialConsoleVotes={initialConsoleVotes} />;
}
