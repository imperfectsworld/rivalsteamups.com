import type { Hero, TeamUpAbility } from "@/src/types";

export const MIN_VERDICT_VOTES = 10;

type Locale = "en" | "es";
type AnalysisInput = {
  hero: Hero;
  heroName: string;
  abilities: [TeamUpAbility, TeamUpAbility];
  totals: [number, number];
  locale: Locale;
};

function mechanicNotes(text: string, locale: Locale) {
  const value = text.toLowerCase();
  const notes: string[] = [];
  const add = (en: string, es: string) => notes.push(locale === "es" ? es : en);

  if (/heal|healing|curaci|health|salud/.test(value)) add("Its sustain component has value in extended fights, but loses impact when allies cannot survive the initial burst.", "Su componente de supervivencia gana valor en combates prolongados, pero pierde impacto si los aliados no sobreviven al daño inicial.");
  if (/shield|barrier|barrera|escudo|block|bloque/.test(value)) add("The defensive layer can deny a predictable damage window, although timing and placement matter more than raw output.", "La capa defensiva puede anular una ventana de daño predecible, aunque el momento y la colocación importan más que el daño bruto.");
  if (/teleport|dash|movement|speed|movimiento|velocidad|leap|salto/.test(value)) add("Extra mobility changes positioning and escape routes, making the option strongest when used proactively rather than as a late panic button.", "La movilidad adicional cambia el posicionamiento y las rutas de escape, por lo que funciona mejor de forma proactiva que como recurso de pánico tardío.");
  if (/slow|stun|blind|launch|knock|vulnerab|control|ralent|aturd|cegad|lanza/.test(value)) add("Its control utility can create a clean focus-fire opportunity, but coordinated teammates are needed to fully convert that opening.", "Su control puede crear una oportunidad clara de enfoque de fuego, pero hace falta coordinación para aprovecharla por completo.");
  if (/area|zone|nearby|radius|zona|cercan|radio|explosion|detona/.test(value)) add("Area pressure makes it especially useful around objectives, doorways, and clustered teams; spread-out fights reduce that advantage.", "La presión de área resulta especialmente útil en objetivos, accesos y equipos agrupados; los combates dispersos reducen esa ventaja.");
  if (/projectile|missile|ammo|reload|proyectil|misil|munici|recarga/.test(value)) add("The ranged-output benefit rewards clear sightlines and steady uptime, while cover-heavy engagements can limit how often it matters.", "La mejora de daño a distancia recompensa líneas de visión limpias y actividad constante, mientras que los combates con mucha cobertura limitan su impacto.");
  if (/cooldown|duration|seconds|segund|duraci|enfriamiento/.test(value)) add("Because the effect is tied to a defined timing window, disciplined activation is more important than simply using it on cooldown.", "Como el efecto depende de una ventana de tiempo definida, una activación disciplinada importa más que usarlo apenas esté disponible.");
  if (/damage|daño|attack|ataque/.test(value)) add("The direct offensive payoff is easy to understand, but it is only decisive when the team can safely maintain pressure.", "La recompensa ofensiva directa es fácil de entender, pero solo resulta decisiva cuando el equipo puede mantener la presión con seguridad.");
  return notes.slice(0, 2);
}

function optionAnalysis(hero: Hero, heroName: string, ability: TeamUpAbility, locale: Locale) {
  const notes = mechanicNotes(`${ability.baseDescription} ${ability.enhancedDescription}`, locale);
  const roleContext = hero.role === "Vanguard"
    ? (locale === "es" ? "Como Vanguard, debe valorarse por cuánto ayuda a iniciar, ocupar espacio o sobrevivir mientras el equipo avanza." : "As a Vanguard, it should be judged by how well it helps initiate, hold space, or survive while the team advances.")
    : hero.role === "Strategist"
      ? (locale === "es" ? "Como Strategist, su valor real depende tanto de la utilidad y la supervivencia del equipo como del daño adicional." : "As a Strategist, its real value depends as much on team utility and survival as on any extra damage.")
      : (locale === "es" ? "Como Duelist, debe valorarse por la consistencia con la que convierte una apertura en presión, daño o una eliminación." : "As a Duelist, it should be judged by how consistently it converts an opening into pressure, damage, or a secured elimination.");
  const enhanced = locale === "es"
    ? `Con el efecto potenciado activo, ${ability.enhancedDescription.charAt(0).toLowerCase()}${ability.enhancedDescription.slice(1)} Esto aumenta el techo de la opción, pero también significa que la composición con ${ability.anchorPartner} debe justificar el espacio de equipo.`
    : `With the Enhanced effect active, ${ability.enhancedDescription.charAt(0).toLowerCase()}${ability.enhancedDescription.slice(1)} That raises the option's ceiling, but it also means the composition with ${ability.anchorPartner} has to justify the team slot.`;

  return locale === "es"
    ? `${ability.name}, anclado por ${ability.anchorPartner}, ofrece a ${heroName} una ruta táctica muy concreta: ${ability.baseDescription} ${roleContext} ${notes.join(" ")} En la práctica, esta opción es ideal cuando tu composición puede jugar alrededor de esa condición y repetirla de forma fiable. Su debilidad aparece cuando el combate obliga a ${heroName} a reaccionar fuera de ese plan, porque parte del valor queda ligado a una ventana, posición o interacción específica. ${enhanced}`
    : `${ability.name}, anchored by ${ability.anchorPartner}, gives ${heroName} a very specific tactical route: ${ability.baseDescription} ${roleContext} ${notes.join(" ")} In practice, this option is best when the composition can play around that condition and reproduce it reliably. Its weakness appears when the fight forces ${heroName} to react outside that plan, because part of the value is tied to a particular window, position, or interaction. ${enhanced}`;
}

export function buildTeamUpAnalysis({ hero, heroName, abilities, totals, locale }: AnalysisInput) {
  const totalVotes = totals[0] + totals[1];
  const isTied = totalVotes > 0 && totals[0] === totals[1];
  const leaderIndex = totals[1] > totals[0] ? 1 : 0;
  const leader = abilities[leaderIndex];
  const runnerUp = abilities[leaderIndex === 0 ? 1 : 0];
  const leaderPercent = totalVotes ? Math.round((totals[leaderIndex] / totalVotes) * 100) : 0;
  const intro = locale === "es"
    ? `${heroName} no está eligiendo simplemente entre dos bonificaciones: ${abilities[0].name} y ${abilities[1].name} empujan su kit hacia prioridades diferentes. La mejor elección depende del mapa, la composición, el ritmo del combate y de si el aliado ancla puede aportar valor por sí mismo. El análisis siguiente compara el efecto base y el potencial mejorado, sin tratar una ventaja situacional como una respuesta universal.`
    : `${heroName} is not simply choosing between two bonuses: ${abilities[0].name} and ${abilities[1].name} push the kit toward different priorities. The better choice depends on map geometry, team composition, fight tempo, and whether the anchor partner already provides value on their own. The analysis below weighs both the base effect and Enhanced ceiling without treating a situational advantage as a universal answer.`;

  let verdict: string;
  if (totalVotes === 0) {
    verdict = locale === "es"
      ? `Veredicto de la comunidad: todavía no hay votos para ${heroName}, así que no existe un líder legítimo. El 50/50 no debe interpretarse como empate; es simplemente un resultado pendiente. Compara qué condición puedes activar con mayor frecuencia y emite el primer voto para empezar a formar una muestra útil.`
      : `Community verdict: ${heroName} does not have any votes in this filter yet, so there is no legitimate leader. A 50/50 display should not be read as a tie; the result is simply awaiting evidence. Compare which condition your team can activate more often, then cast the first vote to begin a useful sample.`;
  } else if (isTied) {
    verdict = locale === "es"
      ? `Veredicto de la comunidad: ${abilities[0].name} y ${abilities[1].name} están empatados con ${totals[0]} votos cada uno. Es un empate real dentro del filtro seleccionado, no un 50/50 generado por falta de datos. Aun así, ${totalVotes < MIN_VERDICT_VOTES ? `la muestra sigue por debajo de ${MIN_VERDICT_VOTES} votos y es demasiado pequeña para una conclusión estable.` : "el empate demuestra que ambas opciones encuentran situaciones competitivas y que el contexto de la composición sigue siendo decisivo."}`
      : `Community verdict: ${abilities[0].name} and ${abilities[1].name} are tied at ${totals[0]} votes each. This is a real tie within the selected filter, not a 50/50 generated by missing data. Even so, ${totalVotes < MIN_VERDICT_VOTES ? `the sample remains below ${MIN_VERDICT_VOTES} votes and is too small for a stable conclusion.` : "the tie shows that both options have competitive situations and composition context remains decisive."}`;
  } else if (totalVotes < MIN_VERDICT_VOTES) {
    verdict = locale === "es"
      ? `Veredicto de la comunidad: ${leader.name} lleva una ventaja inicial con ${leaderPercent}% de ${totalVotes} votos, por delante de ${runnerUp.name}. Es una señal temprana, no una conclusión: menos de ${MIN_VERDICT_VOTES} votos pueden cambiar por completo con unas pocas respuestas. Usa el resultado como punto de conversación y no como una recomendación definitiva.`
      : `Community verdict: ${leader.name} has an early lead at ${leaderPercent}% from ${totalVotes} votes, ahead of ${runnerUp.name}. This is an early signal, not a conclusion: a sample below ${MIN_VERDICT_VOTES} votes can reverse with only a few responses. Treat the result as a discussion point rather than a definitive recommendation.`;
  } else {
    verdict = locale === "es"
      ? `Veredicto de la comunidad: ${leader.name} lidera actualmente con ${leaderPercent}% de ${totalVotes.toLocaleString()} votos, frente a ${runnerUp.name}. Esa preferencia refleja el filtro de rango y plataforma seleccionado, no una verdad absoluta. Si la diferencia es pequeña, ambas opciones siguen siendo competitivas; si es amplia, la comunidad está señalando que el plan de juego de ${leader.name} es más fácil de aprovechar con consistencia.`
      : `Community verdict: ${leader.name} currently leads with ${leaderPercent}% of ${totalVotes.toLocaleString()} votes over ${runnerUp.name}. That preference reflects the selected rank and platform filter, not an absolute truth. A narrow margin means both options remain competitive; a wide one suggests the community finds ${leader.name}'s game plan easier to convert consistently.`;
  }

  return {
    intro,
    options: abilities.map((ability) => optionAnalysis(hero, heroName, ability, locale)) as [string, string],
    verdict,
  };
}
