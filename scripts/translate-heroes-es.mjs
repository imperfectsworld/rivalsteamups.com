import fs from "node:fs/promises";

const source = JSON.parse(await fs.readFile(new URL("../src/data/heroes.json", import.meta.url), "utf8"));
const officialHeroNames = {
  "Adam Warlock":"Adam Warlock","Black Panther":"Pantera Negra","Black Widow":"Viuda Negra","Hulk":"Hulk","Captain America":"Capitán América","Cloak & Dagger":"Capa y Puñal","Doctor Strange":"Doctor Strange","Groot":"Groot","Hawkeye":"Ojo de Halcón","Hela":"Hela","Iron Fist":"Puño de Hierro","Iron Man":"Iron Man","Jeff the Land Shark":"Jeff el Tiburón Terrestre","Loki":"Loki","Luna Snow":"Luna Snow","Magik":"Magik","Magneto":"Magneto","Mantis":"Mantis","Moon Knight":"Caballero Luna","Namor":"Namor","Peni Parker":"Peni Parker","Psylocke":"Psylocke","Punisher":"Punisher","Rocket Raccoon":"Rocket Raccoon","Scarlet Witch":"Bruja Escarlata","Spider-Man":"Spider-Man","Squirrel Girl":"Chica Ardilla","Star-Lord":"Star-Lord","Storm":"Tormenta","Thor":"Thor","Venom":"Venom","Winter Soldier":"Soldado del Invierno","Wolverine":"Wolverine","Mister Fantastic":"Mister Fantástico","Invisible Woman":"Mujer Invisible","Human Torch":"Antorcha Humana","The Thing":"La Mole","Emma Frost":"Emma Frost","Ultron":"Ultron","Phoenix":"Fénix","Blade":"Blade","Angela":"Angela","Daredevil":"Daredevil","Gambit":"Gambito","Rogue":"Rogue","Deadpool (Vanguard)":"Deadpool (Vanguardia)","Deadpool (Duelist)":"Deadpool (Duelista)","Deadpool (Strategist)":"Deadpool (Estratega)","Elsa Bloodstone":"Elsa Bloodstone","Black Cat":"Gata Negra","Devil Dinosaur":"Dinosaurio Diabólico","Cyclops":"Cíclope","Jubilee":"Jubilee","White Fox":"White Fox"
};
const cache = new Map();
async function translate(text) {
  if (!text || cache.has(text)) return cache.get(text) ?? text;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  const data = await response.json();
  const translated = data[0].map((part) => part[0]).join("");
  cache.set(text, translated);
  return translated;
}

for (const hero of source.heroes) hero.nameEs = officialHeroNames[hero.name] ?? await translate(hero.name);
const heroNames = new Map(source.heroes.map((hero) => [hero.name, hero.nameEs]));
heroNames.set("Deadpool", "Deadpool");
const abilities = source.heroes.flatMap((hero) => hero.teamUpAbilities);
let cursor = 0;
async function worker() {
  while (cursor < abilities.length) {
    const ability = abilities[cursor++];
    ability.nameEs = await translate(ability.name);
    ability.anchorPartnerEs = heroNames.get(ability.anchorPartner) ?? await translate(ability.anchorPartner);
    ability.baseDescriptionEs = await translate(ability.baseDescription);
    ability.enhancedDescriptionEs = await translate(ability.enhancedDescription);
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
await fs.writeFile(new URL("../src/data/heroes-es.json", import.meta.url), `${JSON.stringify(source, null, 2)}\n`);
