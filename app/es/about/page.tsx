import type { Metadata } from "next";
import { LegalPage } from "@/app/legal-page";

export const metadata: Metadata = {
  title: "Acerca de Rivals Team-Ups y metodología de votación",
  description: "Conoce quién mantiene Rivals Team-Ups, cómo se recopilan los votos y cómo interpretar los resultados y análisis de Team-Ups.",
  alternates: { canonical: "/es/about", languages: { en: "/about", es: "/es/about" } },
};

export default function AboutPageEs() {
  return <LegalPage eyebrow="ACERCA DEL PROYECTO" title="Acerca de y metodología" updatedLabel="Última revisión: 10 de septiembre de 2026">
    <p>Rivals Team-Ups es un proyecto independiente de la comunidad de Marvel Rivals creado y mantenido por DeAngelo Robinson. Ayuda a comparar habilidades de Team-Up, observar cómo cambian las preferencias según el rango y la plataforma, y compartir experiencias de juego. El proyecto no está afiliado con Marvel ni NetEase Games.</p>
    <h2>Cómo funciona la votación</h2>
    <p>Cada héroe presenta dos opciones de Team-Up. El visitante elige una e indica su rango competitivo y plataforma. Los resultados se pueden filtrar por PC o consola, rango y período disponible. Se utiliza un identificador aleatorio del dispositivo para limitar la votación a una vez por héroe cada 24 horas. No se requiere una cuenta ni se recopila el nombre real del votante.</p>
    <h2>Cómo interpretar los resultados</h2>
    <p>Los porcentajes representan las preferencias enviadas por los visitantes del sitio; no son estadísticas oficiales de selección, victorias o equilibrio. Las muestras de menos de 10 votos se identifican como señales tempranas. Una vista sin votos no muestra una conclusión artificial de 50/50. Los filtros pueden producir resultados diferentes porque incluyen grupos distintos de jugadores.</p>
    <p>La Temporada 10 utiliza una muestra comunitaria acumulada. Sus totales iniciales incluyen los votos recopilados durante las Temporadas 9 y 9.5, y cada nuevo voto de la Temporada 10 se suma a esa base. Los resultados históricos de la Temporada 9.5 siguen disponibles por separado; el filtro de 30 días permite aislar las tendencias recientes.</p>
    <h2>Información oficial y análisis editorial</h2>
    <p>Los nombres y descripciones resumen la información de las habilidades dentro del juego. El análisis editorial aparece por separado y considera el rol del héroe, las condiciones prácticas del efecto, la composición, el posicionamiento y la muestra comunitaria actual. Los veredictos describen los votos disponibles y no son recomendaciones universales.</p>
    <h2>Actualizaciones y correcciones</h2>
    <p>La información se revisa cuando cambian las temporadas y los parches de equilibrio. Los totales se actualizan al registrarse votos; el contenido editorial se revisa cuando cambian las mecánicas o las conclusiones. Para informar un error, escribe a <a href="mailto:NeckBeardDev@gmail.com">NeckBeardDev@gmail.com</a>.</p>
    <h2>Editor</h2>
    <p>DeAngelo Robinson es el desarrollador y editor de Rivals Team-Ups. Puedes conocer más sobre su trabajo en <a href="https://www.linkedin.com/in/deangelo-robinson/" target="_blank" rel="noreferrer">LinkedIn</a> o seguir las novedades en <a href="https://x.com/NeckBeardDev" target="_blank" rel="noreferrer">X</a>.</p>
  </LegalPage>;
}
