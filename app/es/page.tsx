import type { Metadata } from "next";
import Home from "../page";
export const metadata: Metadata = {
  title: "Meta de Team-Ups de Marvel Rivals | Votación de la Temporada 9",
  description: "Compara y vota por los mejores Team-Ups de Marvel Rivals por héroe, rango competitivo y plataforma.",
  alternates: { canonical: "/es", languages: { "en": "/", "es": "/es", "x-default": "/" } },
};
export default function SpanishHome() { return <Home locale="es" />; }
