import type { Metadata } from "next";
import Home from "../HomeClient";
import { getVoteRows, groupVoteRows } from "../vote-data";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Team-Ups de Marvel Rivals | Votación de la Temporada 10.5",
  description: "Mira guías, compara resultados en vivo y vota por los mejores Team-Ups de Marvel Rivals por héroe, rango y plataforma.",
  alternates: { canonical: "/es", languages: { "en": "/", "es": "/es", "x-default": "/" } },
};
export default async function SpanishHome() {
  const initialVotes = groupVoteRows(await getVoteRows());
  return <Home locale="es" initialVotes={initialVotes} />;
}
