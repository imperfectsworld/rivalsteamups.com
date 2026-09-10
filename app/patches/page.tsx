import type { Metadata } from "next";
import PatchDashboard from "./PatchDashboard";
export const metadata: Metadata = { title: "Marvel Rivals Season 10 Team-Up Patch Trends", description: "Compare live Marvel Rivals Team-Up leaders, close community races, platform differences, and preference shifts across patches.", alternates: { canonical: "/patches" } };
export default function PatchesPage() { return <PatchDashboard />; }
