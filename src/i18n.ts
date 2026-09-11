export type SiteLocale = "en" | "es";

const es: Record<string, string> = {
  "Vanguards": "Vanguardias", "Duelists": "Duelistas", "Strategists": "Estrategas",
  "Vanguard": "Vanguardia", "Duelist": "Duelista", "Strategist": "Estratega",
  "All Ranks": "Todos los rangos", "All": "Todos", "Console": "Consola",
  "Bronze":"Bronce","Silver":"Plata","Gold":"Oro","Platinum":"Platino","Diamond":"Diamante","Grandmaster":"Gran Maestro","Celestial":"Celestial","Eternity":"Eternidad","One Above All":"Uno Sobre Todos",
  "A MARVEL RIVALS COMMUNITY TOOL": "UNA HERRAMIENTA DE LA COMUNIDAD DE MARVEL RIVALS",
  "CREATE THE": "CREA EL", "META": "META", "LIVE RANK INSIGHT": "ANÁLISIS DE RANGO EN VIVO",
  "TODAY'S META DEBATE": "EL DEBATE META DE HOY", "24-HOUR FEATURED MATCHUP": "DUELO DESTACADO DE 24 HORAS",
  "VOTE IN TODAY'S DEBATE": "VOTA EN EL DEBATE DE HOY", "YOUR VOTING PROGRESS": "TU PROGRESO DE VOTACIÓN",
  "HEROES": "HÉROES", "PLATFORM DATA": "DATOS DE PLATAFORMA", "PATCH & SEASON HISTORY": "HISTORIAL DE TEMPORADA Y PARCHE",
  "RESULT WINDOW": "PERÍODO DE RESULTADOS", "ALL-TIME": "HISTÓRICO", "LAST 30 DAYS": "ÚLTIMOS 30 DÍAS",
  "SEARCH HERO": "BUSCAR HÉROE", "Search for a hero…": "Busca un héroe…", "FILTER COMMUNITY BY RANK": "FILTRAR LA COMUNIDAD POR RANGO",
  "CHOOSE THE BETTER TEAM-UP": "ELIGE EL MEJOR TEAM-UP", "COMMUNITY CHOICE": "ELECCIÓN DE LA COMUNIDAD",
  "VIEW DETAILS": "VER DETALLES", "EXPAND": "ABRIR", "COLLAPSE": "CERRAR", "ENHANCED OFF": "MEJORA DESACTIVADA",
  "ENHANCED ON": "MEJORA ACTIVADA", "VOTE FOR": "VOTA POR", "TEAM-UP": "TEAM-UP", "CONTACT": "CONTACTO",
  "PATCHES": "PARCHES", "LEGAL": "AVISO LEGAL", "PRIVACY": "PRIVACIDAD", "TERMS": "TÉRMINOS", "COOKIES": "COOKIES",
  "BACK TO TOP": "VOLVER ARRIBA", "BACK TO DIRECTORY": "VOLVER AL DIRECTORIO", "DIRECTORY": "DIRECTORIO",
  "SEASON 10 · HERO INTELLIGENCE": "TEMPORADA 10 · ANÁLISIS DEL HÉROE", "TOTAL VOTES": "VOTOS TOTALES",
  "COMMUNITY LEADER": "LÍDER DE LA COMUNIDAD", "LEAD MARGIN": "VENTAJA", "Team-Up totals": "Totales de Team-Up",
  "Detailed rank breakdown": "Desglose detallado por rango", "Community insights": "Opiniones de la comunidad",
  "EXPLORE THE ROSTER": "EXPLORA EL PLANTEL", "DISPLAY NAME": "NOMBRE", "YOUR RANK": "TU RANGO", "YOUR INSIGHT": "TU OPINIÓN",
  "POST INSIGHT": "PUBLICAR OPINIÓN", "VOTE LOCKED IN": "VOTO CONFIRMADO", "Vote counted": "Voto registrado",
  "VOTE RECORDED": "VOTO REGISTRADO", "ONE LAST STEP": "UN ÚLTIMO PASO", "What rank are you?": "¿Cuál es tu rango?",
  "YOUR PLATFORM": "TU PLATAFORMA", "RECORD MY VOTE": "REGISTRAR MI VOTO", "CLOSE": "CERRAR", "ADD MY INSIGHT": "AÑADIR MI OPINIÓN",
  "S10 · Cumulative":"S10 · Acumulado", "S9.5 · Launch":"S9.5 · Lanzamiento", "ARCHIVE · S9/S9.5":"ARCHIVO · S9/S9.5", "COMMUNITY META":"META DE LA COMUNIDAD",
};

export function translate(locale: SiteLocale, value: string) { return locale === "es" ? (es[value] ?? value) : value; }
export function localePath(locale: SiteLocale, path: string) { return locale === "es" ? `/es${path === "/" ? "" : path}` : path; }
