import type { Metadata } from "next";
import Home from "../HomeClient";
import { getVoteRows, groupVoteRows } from "../vote-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Meta de Team-Ups de Marvel Rivals | Votación de la Temporada 9.5",
  description: "Compara y vota por los mejores Team-Ups de Marvel Rivals por héroe, rango competitivo y plataforma.",
  alternates: { canonical: "/es", languages: { "en": "/", "es": "/es", "x-default": "/" } },
};
export default async function SpanishHome() {
  const initialVotes = groupVoteRows(await getVoteRows());
  return <Home locale="es" initialVotes={initialVotes} />;
}
