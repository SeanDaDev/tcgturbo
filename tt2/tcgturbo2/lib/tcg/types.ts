export type ElementType = 'solar' | 'void' | 'verdant' | 'tide' | 'astral';
export type CardType = 'creature' | 'spell' | 'ward';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Keyword = 'Taunt' | 'Aegis' | 'Rush' | 'Lifesteal' | 'Freeze' | 'Deathrattle' | 'Resonance' | 'Overpower' | 'Stealth' | 'Regen';

export type GameMode = 'couch_2p' | 'solo_ai';
export type TurnPhase = 'main' | 'combat' | 'end';

export interface CardDef {
  id: string;
  name: string;
  element: ElementType;
  form?: 1 | 2 | 3;
  ascendsFrom?: ElementType;
  type: CardType;
  cost: number;
  atk?: number;
  hp?: number;
  rarity: Rarity;
  art: string;
  cropOffset?: string;
  keywords?: Keyword[];
  desc?: string;
  lore?: string;
  hasTaunt?: boolean;
  hasAegis?: boolean;
  canAttackOnSummon?: boolean;
  lifesteal?: boolean;
  targetType?: 'any_enemy' | 'enemy_unit' | 'friendly_unit' | 'none';
  trigger?: 'on_vanguard_attacked' | 'on_enemy_ascend' | 'on_creature_attack' | 'on_direct_attack' | 'on_lethal_damage';
}

export interface CardInstance extends CardDef {
  instanceId: string;
  currentAtk: number;
  currentHp: number;
  maxHp: number;
  canAttack: boolean;
  hasAttackedThisTurn: boolean;
  frozen: boolean;
  hasAegis: boolean;
  isAscended?: boolean;
}

export interface HeroPower {
  name: string;
  cost: number;
  desc: string;
  icon?: string;
}

export interface VanguardHero {
  id: string;
  name: string;
  title: string;
  element: ElementType;
  avatar: string;
  hp: number;
  maxHp: number;
  heroPower: HeroPower;
  heroPowerUsed?: boolean;
}

export interface PlayerState {
  id: 1 | 2;
  name: string;
  isAI: boolean;
  vanguard: VanguardHero;
  mana: number;
  maxMana: number;
  deck: CardInstance[];
  hand: CardInstance[];
  board: (CardInstance | null)[]; // 5 creature lanes
  wards: (CardInstance | null)[]; // 3 secret trap slots
  graveyard: CardInstance[];
  extraTurns: number;
}

export interface ActionLog {
  id: string;
  text: string;
  type: 'log-attack' | 'log-summon' | 'log-ascend' | 'log-trap' | 'log-turn' | 'log-info';
  time: string;
}

export interface FloatingCombatText {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'ascend' | 'shield';
  x: number;
  y: number;
}

export interface PresetDeck {
  name: string;
  vanguard: string;
  description: string;
  element: ElementType;
  cards: string[];
}

export interface GameState {
  mode: GameMode;
  round: number;
  currentTurn: 1 | 2;
  phase: TurnPhase;
  isPrivacyCurtainActive: boolean;
  winner: null | 1 | 2 | 'draw';
  players: [PlayerState, PlayerState];
  actionLogs: ActionLog[];
  floatingTexts: FloatingCombatText[];
}
