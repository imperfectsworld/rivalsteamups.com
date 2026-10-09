import type { Metadata } from "next";
import { LegalPage } from "@/app/legal-page";

export const metadata: Metadata = {
  title: "Acerca de Rivals Team-Ups y metodología de votación",
  description: "Conoce quién mantiene Rivals Team-Ups, cómo se recopilan los votos y cómo interpretar los resultados y análisis de Team-Ups.",
  alternates: { canonical: "/es/about", languages: { en: "/about", es: "/es/about" } },
};

export default function AboutPageEs() {
  return <LegalPage eyebrow="ACERCA DEL PROYECTO" title="Acerca de y metodología" updatedLabel="Última revisión: 8 de octubre de 2026">
    <p>Rivals Team-Ups es un proyecto independiente de la comunidad de Marvel Rivals creado y mantenido por DeAngelo Robinson. Ayuda a comparar habilidades de Team-Up, observar cómo cambian las preferencias según el rango y la plataforma, y compartir experiencias de juego. El proyecto no está afiliado con Marvel ni NetEase Games.</p>
    <h2>Qué aporta este proyecto</h2>
    <p>El sitio no es una copia de una wiki. Su servicio original es un conjunto de datos de votación estructurado que compara dos opciones de Team-Up por héroe, separa las respuestas de PC y consola, desglosa las preferencias por rango competitivo, registra el movimiento reciente y publica el contexto escrito por los jugadores. El informe de cambios convierte esos votos en señales de consenso, carreras reñidas y diferencias entre plataformas.</p>
    <h2>Cómo funciona la votación</h2>
    <p>Cada héroe presenta dos opciones de Team-Up. El visitante elige una e indica su rango competitivo y plataforma. Los resultados se pueden filtrar por PC o consola, rango y período disponible. Se utiliza un identificador aleatorio del dispositivo para limitar la votación a una vez por héroe cada 24 horas. No se requiere una cuenta ni se recopila el nombre real del votante.</p>
    <h2>Cómo interpretar los resultados</h2>
    <p>Los porcentajes representan las preferencias enviadas por los visitantes del sitio; no son estadísticas oficiales de selección, victorias o equilibrio. Las muestras de menos de 10 votos se identifican como señales tempranas. Una vista sin votos no muestra una conclusión artificial de 50/50. Los filtros pueden producir resultados diferentes porque incluyen grupos distintos de jugadores.</p>
    <p>La Temporada 10.5 utiliza la misma muestra comunitaria acumulada de la Temporada 10. Incluye los votos de las Temporadas 9, 9.5 y 10, y cada nuevo voto de la Temporada 10.5 se suma a esa base. El filtro de 30 días permite aislar la participación reciente.</p>
    <h2>Información y páginas de video</h2>
    <p>Los nombres y descripciones resumen la información de las habilidades dentro del juego. Cada página de héroe funciona como una página de video dedicada: primero presenta una guía destacada y luego los resultados en vivo, el desglose por rango y las opiniones de jugadores para ese héroe.</p>
    <h2>Estándares editoriales</h2>
    <p>El análisis original está identificado y atribuido al editor. La información de las habilidades del juego se presenta por separado para que el lector pueda distinguirla de los comentarios. Cada conclusión basada en datos muestra el tamaño de la muestra, y las vistas con menos de 10 votos se señalan como resultados preliminares. Las preferencias comunitarias no se presentan como tasas oficiales de selección, victoria o estadísticas de equilibrio.</p>
    <p>Los videos de creadores complementan los votos, el análisis y los desgloses por rango del sitio; no los sustituyen. Ningún creador paga para recibir un veredicto favorable.</p>
    <h2>Actualizaciones y correcciones</h2>
    <p>La información se revisa cuando cambian las temporadas y los parches de equilibrio. Los totales se actualizan al registrarse votos; el contenido editorial se revisa cuando cambian las mecánicas o las conclusiones. Para informar un error, escribe a <a href="mailto:NeckBeardDev@gmail.com">NeckBeardDev@gmail.com</a>.</p>
    <h2>Editor</h2>
    <p>DeAngelo Robinson es el desarrollador y editor de Rivals Team-Ups. Puedes conocer más sobre su trabajo en <a href="https://www.linkedin.com/in/deangelo-robinson/" target="_blank" rel="noreferrer">LinkedIn</a> o seguir las novedades en <a href="https://x.com/NeckBeardDev" target="_blank" rel="noreferrer">X</a>.</p>
  </LegalPage>;
}
