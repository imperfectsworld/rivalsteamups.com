export type HeroRole = "Vanguard" | "Duelist" | "Strategist";

export type TeamUpSlot = "A" | "B";

export interface TeamUpAbility {
  id: string;
  slot: TeamUpSlot;
  name: string;
  anchorPartner: string;
  baseDescription: string;
  enhancedDescription: string;
}

export interface Hero {
  id: string;
  name: string;
  role: HeroRole;
  teamUpAbilities: [TeamUpAbility, TeamUpAbility];
}

export interface HeroesData {
  heroes: Hero[];
}
